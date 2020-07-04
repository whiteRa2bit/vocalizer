import logging
import os
import tarfile
import tempfile
import time
import urllib3
from typing import Optional

import requests
import pika
import pika.exceptions

from splitting import Splitter, SPLITTER_BY_TYPE


urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


def env_or_default(name, default):
    value = os.getenv(name)
    if value is None:
        value = default
    return value


def env_or_default_addr(name, default_host, default_port):
    addr = env_or_default(name, f'{default_host}:{default_port}')
    if ':' not in addr:
        addr += f':{default_port}'
    host, port = addr.rsplit(':', 1)
    port = int(port)
    return addr, host, port


BACKEND_ADDR, BACKEND_HOST, BACKEND_PORT = env_or_default_addr('BACKEND_ADDR', 'localhost', 8000)
BROKER_ADDR, BROKER_HOST, BROKER_PORT = env_or_default_addr('BROKER_ADDR', 'localhost', 5672)
if not BACKEND_ADDR.startswith('http'):
    BACKEND_ADDR = f'http://{host}'


SPLITTER_TYPE = env_or_default('SPLITTER_TYPE', 'cpu').lower()


LOGGER = logging.getLogger(__name__)

SPLITTER: Optional[Splitter] = None


def upload_result(song_bytes, song_hash):
    resp = requests.post(
        f'{BACKEND_ADDR}/songs/{song_hash}/upload_result',
        data=song_bytes,
        headers={'Content-Type': 'application/x-tar'},
        verify=False)
    if resp.status_code != 200:
        raise ValueError(
            f'Error while uploading result: backend returned {resp.status_code}. Response body (truncated):'
            f'\n{resp.content[:400]}')


def split(song_bytes, song_hash):
    with tempfile.TemporaryDirectory() as tempdir:
        source_path = os.path.join(tempdir, f'source.mp3')
        result_dir_path = os.path.join(tempdir, 'result')
        result_path = os.path.join(tempdir, 'result.tar')
        with open(source_path, 'wb') as source:
            source.write(song_bytes)

        SPLITTER.split(source_path, result_dir_path)

        with tarfile.open(result_path, 'w') as result:
            to_add = os.path.join(result_dir_path, 'source')
            for filename in os.listdir(to_add):
                result.add(os.path.join(to_add, filename), arcname=filename)
        result.close()

        with open(result_path, 'rb') as result_file:
            result_data = result_file.read()

        upload_result(result_data, song_hash)


def process_message(channel, method, properties, body):
    song_hash = properties.message_id
    LOGGER.info('Received %s', song_hash)
    try:
        split(song_bytes=body, song_hash=song_hash)
        LOGGER.info('Successfully processed %s', song_hash)
    except Exception:
        LOGGER.exception('Error while processing %s', song_hash)

    channel.basic_ack(delivery_tag=method.delivery_tag)


def create_channel():
    connection = pika.BlockingConnection(pika.ConnectionParameters(
        host=BROKER_HOST,
        port=BROKER_PORT))
    channel = connection.channel()
    channel.queue_declare(queue='vocalizer_queue', durable=True)

    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue='vocalizer_queue', on_message_callback=process_message)
    return channel


def main():
    if SPLITTER_TYPE not in SPLITTER_BY_TYPE.keys():
        LOGGER.error(
            'The enviroment variable SPLITTER_TYPE should be one of '
            + ', '.join(f'"{key}"' for key in SPLITTER_BY_TYPE))
        return

    global SPLITTER
    LOGGER.info(f'Preparing the splitter (using SPLITTER_TYPE="{SPLITTER_TYPE}")')
    SPLITTER = SPLITTER_BY_TYPE[SPLITTER_TYPE]()
    LOGGER.info('Splitter is ready; connecting to the queue')

    delay = 1
    while True:
        try:
            channel = create_channel()
        except pika.exceptions.AMQPConnectionError:
            LOGGER.info(f'Failed to connect; will retry in {delay} seconds')
            time.sleep(delay)
            delay = min(delay * 2, 15)
            continue

        LOGGER.info('Connected successfully')
        delay = 1
        try:
            LOGGER.info('Starting consuming')
            channel.start_consuming()
        except pika.exceptions.AMQPConnectionError:
            LOGGER.info('Connection lost; reconnecting')


if __name__ == '__main__':
    logging.basicConfig(format='{asctime} - {levelname}:\t{message}', style='{')
    LOGGER.setLevel(logging.INFO)
    main()
