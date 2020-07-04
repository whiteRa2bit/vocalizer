import hashlib
import os
import shutil
import tarfile
import tempfile
from functools import wraps

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.db.models import Q
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_http_methods

from .forms import UploadFileForm
from .models import AudioFile, Song
from .settings import MAX_SONG_SIZE
from .queue import try_enqueue_song


def _success(data=None):
    response_dict = {'ok': True, 'errors': {}}
    if data is not None:
        response_dict['data'] = data
    return JsonResponse(response_dict)


def _error(errors, status=400):
    return JsonResponse({'ok': False, 'errors': errors}, status=status)


@require_http_methods(['POST'])
def register(request):
    form = UserCreationForm(request.POST)
    if not form.is_valid():
        return _error(form.errors)

    form.save()
    username = form.cleaned_data.get('username')
    password = form.cleaned_data.get('password1')
    user = authenticate(username=username, password=password)
    login(request, user)
    return _success()


@require_http_methods(['POST'])
def login_view(request):
    form = AuthenticationForm(data=request.POST)
    if not form.is_valid():
        return _error(form.errors)
    login(request, form.get_user())
    return _success()


@require_http_methods(['POST'])
def logout_view(request):
    logout(request)
    return _success()


def _user_passes_test(test, error_message='Not enough permissions'):
    def decorator(wrapped):
        @wraps(wrapped)
        def wrapper(request, *args, **kwargs):
            if not test(request.user):
                return _error(error_message, status=403)
            return wrapped(request, *args, **kwargs)
        return wrapper
    return decorator


login_required = _user_passes_test(
    lambda u: u.is_authenticated,
    error_message='You should be logged in to access this endpoint')


superuser_required = _user_passes_test(
    lambda u: u.is_superuser,
    error_message='You should be a superuser to access this endpoint')


def is_accessible_by(song, user):
    if song.uploader is None:
        return True
    if user is None or not user.is_authenticated:
        return False
    if user.is_superuser:
        return True
    return song.uploader.id == user.id


def _load_song(wrapped, check_accessibility=True):
    @wraps(wrapped)
    def wrapper(request, *args, **kwargs):
        if 'song_id' not in kwargs:
            raise TypeError('Argument "song_id" not found; cannot load a song without it')
        song_id = kwargs.pop('song_id')

        try:
            song = Song.objects.get(pk=song_id)
        except Song.DoesNotExist:
            return _error({'song_id': f'No song with id={song_id} has been found'}, status=404)

        if check_accessibility and not is_accessible_by(song, request.user):
            return _error('No permission to access this song', status=403)

        kwargs['song'] = song
        return wrapped(request, *args, **kwargs)
    return wrapper


def load_song(*args, check_accessibility=True):
    if args:
        wrapped, = args
        return _load_song(wrapped, check_accessibility=check_accessibility)
    else:
        return lambda wrapped: _load_song(wrapped, check_accessibility=check_accessibility)


@require_http_methods(['GET'])
def list_endpoint(request):
    songs = Song.objects.all()
    if not request.user.is_superuser:
        songs = songs.filter(Q(uploader_id=request.user.id) | Q(uploader_id__isnull=True))
    return _success({'songs': [s.to_dict() for s in songs]})


@require_http_methods(['GET', 'DELETE'])
@load_song
def song_endpoint(request, song):
    if request.method == 'DELETE':
        delete_song(song)
        return _success()
    else:
        return _success({'song': song.to_dict()})


def delete_song(song):
    song.delete()
    if not song.audio_file.song_set.exists():
        shutil.rmtree(song.audio_file.paths.root, ignore_errors=False)
        song.audio_file.delete()
    return _success()


@require_http_methods(['POST'])
def upload_endpoint(request):
    form = UploadFileForm(request.POST, request.FILES)
    if not form.is_valid():
        return _error(form.errors)

    file = request.FILES['file']
    if file.size > MAX_SONG_SIZE:
        return _error({'file': f'Maximum file size of {MAX_SONG_SIZE} bytes exceeded'})

    song_bytes = file.read()
    song_hash = hashlib.sha256(song_bytes).hexdigest()

    try:
        audio_file = AudioFile.objects.get(pk=song_hash)
    except AudioFile.DoesNotExist:
        audio_file = AudioFile(hash=song_hash)
        audio_file.save()

    if not audio_file.paths.exists:
        save_audio_file(audio_file, song_bytes)

    uploader = request.user
    if not uploader.is_authenticated:
        uploader = None
    song = Song(title=form.data['title'], audio_file=audio_file, uploader=uploader)
    song.save()
    if not audio_file.paths.is_split:
        if not try_enqueue_song(song_bytes, str(song.audio_file.hash)):  # TODO: check whether already enqueued
            return _error({'file': 'Internal error while scheduling the song for processing'}, status=500)

    return _success({'song': song.to_dict()})


def save_audio_file(audio_file, song_bytes):
    os.makedirs(audio_file.paths.root, exist_ok=False)
    with open(audio_file.paths.song, 'wb') as destination:
        destination.write(song_bytes)


@require_http_methods(['GET'])
@load_song
def download_endpoint(request, song, part):
    part_path = getattr(song.audio_file.paths, part, None)
    if part_path is None:
        return _error({'part': f'Invalid part "{part}"'})
    if not os.path.isfile(part_path):
        return _error({'part': f'Part "{part}" not found'}, status=404)

    with open(part_path, 'rb') as part_data:
        response = HttpResponse(part_data)
        response['Content-Type'] = 'audio/mpeg'
        response['Content-Disposition'] = f'attachment; filename="{song.title}.{part}.mp3"'
        return response


# TODO require_superuser
@require_http_methods(['POST'])
def upload_result(request, hash):
    try:
        audio_file = AudioFile.objects.get(pk=hash)
    except AudioFile.DoesNotExist:
        return _error({'hash': f'No audio file with hash={hash} has been found'}, status=404)

    data = request.read()
    with tempfile.TemporaryDirectory() as tempdir:
        archive_path = os.path.join(tempdir, 'result.tar')
        with open(archive_path, 'wb') as archive:
            archive.write(data)
        with tarfile.open(archive_path) as tar:
            tar.extractall(audio_file.paths.root)
    return _success()
