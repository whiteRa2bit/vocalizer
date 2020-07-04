import os
from enum import Enum

from django.db import models
from django.contrib.auth.models import User

from .settings import HASH_LENGTH, MAX_TITLE_LENGTH, SONG_DIR


def _make_property(filename):
    @property
    def get(self):
        return os.path.join(SONG_DIR, self.song_hash, filename)
    return get


class AudioFileStatus(Enum):
    NOT_FOUND = 0
    UPLOADING = 1
    UPLOADED = 2
    SPLITTING = 3
    SPLIT = 4


class AudioFilePaths:
    def __init__(self, song_hash):
        self.song_hash = song_hash

    root = _make_property('')
    song = _make_property('song.mp3')
    bass = _make_property('bass.mp3')
    drums = _make_property('drums.mp3')
    other = _make_property('other.mp3')
    vocals = _make_property('vocals.mp3')

    @property
    def exists(self):
        return os.path.isdir(self.root)

    @property
    def is_split(self):
        return all(os.path.isfile(path) for path in (self.bass, self.drums, self.other, self.vocals))

    @property
    def status(self):
        if not self.exists:
            return AudioFileStatus.NOT_FOUND
        if not self.is_split:
            return AudioFileStatus.UPLOADED
        return AudioFileStatus.SPLIT


class AudioFile(models.Model):
    hash = models.CharField(max_length=HASH_LENGTH, primary_key=True)

    @property
    def paths(self):
        return AudioFilePaths(self.hash)


class Song(models.Model):
    title = models.CharField(max_length=MAX_TITLE_LENGTH)
    audio_file = models.ForeignKey(AudioFile, on_delete=models.CASCADE)
    uploader = models.ForeignKey(User, on_delete=models.CASCADE, null=True, default=None)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'hash': self.audio_file.hash,
            'uploader_id': self.uploader_id,
            'status': self.audio_file.paths.status.name}
