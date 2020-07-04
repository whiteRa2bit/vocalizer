import argparse
import hashlib
import io
import os
import tarfile
import time
import urllib3

import requests


urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


with open('audio_example.mp3', 'rb') as f:
    EXAMPLE_HASH = hashlib.sha256(f.read()).hexdigest()


class TemplateFiller:
    def __new__(cls, *template_args, **template_kwargs):
        instance = object.__new__(cls)
        for name, template in cls.__dict__.items():
            if name.startswith('_'):
                continue
            setattr(instance, name, template.format(*template_args, **template_kwargs))
        instance.__init__(*template_args, **template_kwargs)
        return instance


class BackendPaths(TemplateFiller):
    register = '{addr}/auth/register'
    login = '{addr}/auth/login'
    logout = '{addr}/auth/logout'
    list_songs = '{addr}/songs/'
    upload_song = '{addr}/songs/upload'
    get_song_info = '{addr}/songs/{{song_id}}'
    delete_song = '{addr}/songs/{{song_id}}'
    split_song = '{addr}/songs/{{song_id}}/split'
    download_part = '{addr}/songs/{{song_id}}/{{part}}.mp3'


class InferenceServerPaths(TemplateFiller):
    split = '{addr}/split'


ANY = object()


def approximately_equal(left, right):
    if ANY in (left, right):
        return True
    if isinstance(left, dict):
        if not isinstance(right, dict) or left.keys() != right.keys():
            return False
        return all(approximately_equal(left[key], right[key]) for key in left)
    return left == right


def _assert_success(resp, expected_data=None, check_json=True, check_data=True):
    if resp.status_code != 200:
        raise ValueError(str(resp.status_code) + ' ' + resp.content.decode('utf-8'))
    if check_json:
        actual_answer = resp.json()
        expected_answer = {'ok': True, 'errors': {}}
        if not check_data:
            if 'data' in actual_answer:
                expected_answer['data'] = ANY
        elif expected_data is not None:
            expected_answer['data'] = expected_data
        assert approximately_equal(expected_answer, actual_answer), actual_answer


class BackendTestClient:
    def __init__(self, addr):
        self.paths = BackendPaths(addr=addr)
        self._example_id = None
        self._sess = requests.Session()
        self._sess.verify = False

    def register(self, username, password):
        resp = self._sess.post(
            self.paths.register,
            data=dict(username=username, password1=password, password2=password))
        _assert_success(resp)

    def login(self, username, password):
        resp = self._sess.post(self.paths.login, data=dict(username=username, password=password))
        _assert_success(resp)

    def logout(self):
        resp = self._sess.post(self.paths.logout)
        _assert_success(resp)

    @property
    def example_id(self):
        if self._example_id is None:
            example_ids = self.find_ids_by_hash(EXAMPLE_HASH)
            if example_ids:
                self._example_id = example_ids[0]
        return self._example_id

    def find_ids_by_hash(self, hash):
        result = []
        for song in self.list_songs():
            if song['hash'] == hash:
                result.append(song['id'])
        return result

    def upload_example(self):
        with open('audio_example.mp3', 'rb') as source:
            resp = self._sess.post(
                self.paths.upload_song,
                data={'title': 'example'},
                files={'file': source})
        _assert_success(resp, expected_data={'song': {
            'id': ANY, 'title': 'example', 'hash': EXAMPLE_HASH, 'uploader_id': ANY, 'status': ANY}})
        song = resp.json()['data']['song']
        self._example_id = song['id']
        return song

    def download_example(self):
        base = 'backend_result'
        os.makedirs(base, exist_ok=True)
        for part in ('song', 'bass', 'drums', 'other', 'vocals'):
            resp = self._sess.get(self.paths.download_part.format(song_id=self.example_id, part=part))
            _assert_success(resp, check_json=False)
            with open(os.path.join(base, f'{part}.mp3'), 'wb') as f:
                f.write(resp.content)

    def delete_song(self, song_id):
        resp = self._sess.delete(self.paths.delete_song.format(song_id=song_id))
        _assert_success(resp)
        if self._example_id == song_id:
            self._example_id = None

    def delete_song_by_hash(self, hash):
        for song_id in self.find_ids_by_hash(hash):
            self.delete_song(song_id)

    def delete_example(self):
        self.delete_song(self.example_id)

    def delete_example_by_hash(self):
        self.delete_song_by_hash(EXAMPLE_HASH)

    def get_example_info(self):
        resp = self._sess.get(self.paths.get_song_info.format(song_id=self.example_id))
        _assert_success(resp, expected_data={'song': {
            'id': self.example_id, 'title': 'example', 'hash': EXAMPLE_HASH, 'uploader_id': ANY, 'status': ANY}})
        return resp.json()['data']['song']

    def list_songs(self):
        resp = self._sess.get(self.paths.list_songs)
        _assert_success(resp, expected_data={'songs': ANY})
        return resp.json()['data']['songs']

    def perform_integration_test(self):
        self.delete_example_by_hash()

        print('Listing')
        song_list = self.list_songs()
        assert not any(song['hash'] == EXAMPLE_HASH for song in song_list), song_list

        print('Uploading')
        upload_info = self.upload_example()
        expected_info = {
            'id': upload_info['id'],
            'title': 'example',
            'hash': EXAMPLE_HASH,
            'uploader_id': upload_info['uploader_id'],
            'status': upload_info['status']}
        separate_info = self.get_example_info()
        assert upload_info == expected_info, upload_info
        assert separate_info == expected_info, separate_info
        song_list = self.list_songs()
        assert expected_info in song_list, song_list

        done = False
        while not done:
            info = self.get_example_info()
            done = info['status'] == 'SPLIT'
            if not done:
                print('Processing in progress. Waiting...')
                time.sleep(2)
        print('Processing done')

        print('Downloading')
        self.download_example()

        print('Deleting')
        self.delete_example()
        assert not any(song['id'] == expected_info['id'] for song in self.list_songs())
        self.delete_example_by_hash()
        assert not any(song['hash'] == EXAMPLE_HASH for song in self.list_songs())


class InferenceTestClient:
    def __init__(self, addr):
        self.paths = InferenceServerPaths(addr=addr)

    def split_example(self):
        base = 'inference_result'
        os.makedirs(base, exist_ok=True)
        with open('audio_example.mp3', 'rb') as source:
            resp = requests.post(self.paths.split, data=source, headers={'Content-Type': 'audio/mpeg'})
        _assert_success(resp, check_json=False)
        with tarfile.open(fileobj=io.BytesIO(resp.content)) as tar:
            tar.extractall(base)


ACTIONS = dict(
    register='backend.register',
    logout='backend.logout',
    upload='backend.upload_example',
    download='backend.download_example',
    delete='backend.delete_example',
    delete_by_hash='backend.delete_example_by_hash',
    status='backend.get_example_info',
    list='backend.list_songs',
    integration='backend.perform_integration_test',
    inference_split='inference.split_example')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--addr', default='http://localhost:8000')
    parser.add_argument('--username', default='')
    parser.add_argument('--password', default='')
    parser.add_argument('command', default='integration', choices=ACTIONS.keys())
    args = parser.parse_args()
    
    if not args.addr.startswith('http'):
        args.addr = f'http://{args.addr}'

    clients = dict(
        backend=BackendTestClient(args.addr),
        inference=InferenceTestClient(args.addr))
    action = ACTIONS[args.command]
    client_name, method_name = action.split('.')
    client = clients[client_name]
    method = getattr(client, method_name)
    method_args = ()
    if method_name == 'register':
        method_args = args.username, args.password
    elif args.username:
        client.login(args.username, args.password)

    result = method(*method_args)
    if result is not None:
        print(result)


if __name__ == '__main__':
    main()
