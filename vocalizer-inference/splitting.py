import subprocess
from abc import ABC

from spleeter.separator import Separator


class Splitter(ABC):
    def split(self, source_path, result_dir_path):
        raise NotImplementedError


class ProcessSplitter(Splitter):
    def split(self, source_path, result_dir_path):
        process = subprocess.run(f'spleeter separate -i {source_path} -p spleeter:4stems -c mp3 -o {result_dir_path}'.split())
        if process.returncode != 0:
            raise ValueError(
                f'Splitting has failed with process code {process.returncode}.'
                f'\n\nStdout: {process.stdout}'
                f'\n\nStderr: {process.stderr}')


class CPUSplitter(Splitter):
    def __init__(self):
        self.separator = Separator('spleeter:4stems')

    def split(self, source_path, result_dir_path):
        self.separator.separate_to_file(source_path, result_dir_path, codec='mp3')


SPLITTER_BY_TYPE = dict(
    process=ProcessSplitter,
    cpu=CPUSplitter,
    gpu=None)
