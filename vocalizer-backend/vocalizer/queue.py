import threading

import pika
import pika.exceptions

from .settings import BROKER_HOST, BROKER_PORT


class ConnectionManager:
    _storage = threading.local()

    def _create_connection(self):
        return pika.BlockingConnection(pika.ConnectionParameters(
            host=BROKER_HOST,
            port=BROKER_PORT))

    @property
    def connection(self):
        if not hasattr(self._storage, 'connection') or not self._storage.channel.is_open:
            self.close()
            self._storage.connection = self._create_connection()
        return self._storage.connection

    @property
    def channel(self):
        if not hasattr(self._storage, 'channel') or not self._storage.channel.is_open:
            self._storage.channel = self.connection.channel()
        return self._storage.channel

    def close(self):
        for attr in ('channel', 'connection'):
            if hasattr(self._storage, attr):
                obj = getattr(self._storage, attr)
                if obj.is_open:
                    obj.close()
                delattr(self._storage, attr)

    def __del__(self):
        self.close()


CONNECTION_MANAGER = ConnectionManager()


def try_enqueue_song(song_bytes, song_hash):
    try:
        CONNECTION_MANAGER.channel.queue_declare(queue='vocalizer_queue', durable=True)
        CONNECTION_MANAGER.channel.basic_publish(
            exchange='',
            routing_key='vocalizer_queue',
            body=song_bytes,
            properties=pika.BasicProperties(
                message_id=song_hash,
                delivery_mode=2))  # make message persistent
        return True
    except pika.exceptions.AMQPConnectionError:
        return False
