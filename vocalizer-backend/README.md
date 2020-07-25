### RabbitMQ

Песни, которые нужно обработать, передаются от бекенда на воркеры посредством очереди `vocalizer_queue`, которую поддерживает RabbitMQ. Тело сообщения в очереди --- это сырые байты файла с песней, а `message_id` в метаданных --- его хэш.

Сейчас RabbitMQ запущен на `84.201.156.96:5672`.

Запуск (порт 15672 можно и не пробрасывать: это админская веб-консоль):

```
sudo docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

### Inference

В репозитории [vocalizer-inference](https://gitlab.com/hse-how-to-make-a-startup/projects/vocal-extractor-acapellizer/vocalizer-inference) лежит инференс-воркер. Он подключается к очереди по адресу из переменной окружения `BROKER_ADDR`, забирает оттуда новые песни и после обработки загружает результат на бекенд-сервер по адресу из переменной окружения `BACKEND_ADDR`.

Результат обработки --- tar-архив с файлами `bass.mp3`, `drums.mp3`, `other.mp3` и `vocals.mp3`, который загружается на бекенд в теле POST-запроса на `/songs/<hash>/upload_result`.

Воркеры независимы и не имеют внутреннего состояния, поэтому можно запустить несколько воркеров: они все подключатся к очереди и будут брать оттуда песни в произвольном порядке.

Запуск:

```
cd vocalizer-inference
docker build -t inference .
docker run --env BROKER_ADDR=84.201.156.96:5672 --env BACKEND_ADDR=https://api.songsplitter.com:443 inference
```

Запуск GPU-воркера:

```
cd vocalizer-inference
docker build -t inference-gpu -f Dockerfile-gpu .
docker run --env CUDA_VISIBLE_DEVICES=X --env BROKER_ADDR=84.201.156.96:5672 --env BACKEND_ADDR=https://api.songsplitter.com:443 inference-gpu
```

Здесь вместо X нужно подставить номер свободной GPU, который можно узнать из вывода `nvidia-smi`. Собранный образ есть на шадовском GPU-сервере almaren.

### Backend

В репозитории [vocalizer-backend](https://gitlab.com/hse-how-to-make-a-startup/projects/vocal-extractor-acapellizer/vocalizer-backend) лежит сервер, который принимает запросы от фронта и умеет сохранять песни, класть их в очередь по адресу из переменной окружения `BROKER_ADDR` и отдавать результат обработки.

Работать с песнями можно анонимно, а можно в рамках пользовательской сессии. Песни, загруженные анонимными пользователями, доступны всем, а загруженные залогиненными пользователями --- только инициатору загрузки. (Исключение: пока что нет аутентификации инференс-воркеров, поэтому эндпоинт `upload_result` доступен всем.)

Эндпоинты:
* `POST /auth/register` --- зарегистрировать нового пользователя и залогиниться. Принимает поля `username`, `password1` и `password2`.
* `POST /auth/login` --- залогиниться. Принимает поля `username` и `password`.
* `POST /auth/logout` --- выйти из пользовательской сессии.
* `GET /songs/` --- получить список загруженных песен (в поле `data.songs`). Каждая песня описывается словарём с полями `id`, `title`, `hash`, `uploader_id` и `status`, где `status` может принимать значения `NOT_FOUND`, `UPLOADING`, `UPLOADED`, `SPLITTING` или `SPLIT` (сейчас поддерживаются только статусы `UPLOADED` и `SPLIT`, а вместо `NOT_FOUND` возвращается ошибка 404).
* `POST /songs/upload` --- загрузить новую песню. Кладёт песню в очередь и в формате `multipart/form-data` принимает поля `title` и `file`. Возвращает словарь с описанием песни в поле `data.song`, а `uploader_id` анонимных пользователей --- `null`.
* `GET /songs/<song_id>` --- возвращает словарь с описанием песни в поле `data.song`.
* `DELETE /songs/<song_id>` --- удалить загруженную песню. В случае, если песен с таким хэшом больше не осталось, удаляются также исходный файл и результат его обработки.
* `GET /songs/<song_id>/<part>.mp3` --- скачать саму песню или результат инференса. `<part>` должна равняться `song`, `bass`, `drums`, `other` или `vocals`.
* `POST /songs/<hash>/upload_result` --- принимает результат обработки от инференс-воркера в виде tar-архива в теле запроса.

Эндпоинты возвращают JSON-объект с полями `ok` (булево поле, указывающее, успешно ли выполнен запрос), `errors` (описание ошибок, если они есть), и `data` (ответ на запрос, если есть). Исключение --- получение mp3, где в успешном случае возвращается файл напрямую.

Запуск:

Следуйте туториалу https://uwsgi-docs.readthedocs.io/en/latest/tutorials/Django_and_nginx.html

Должен получится следующий конфиг для nginx:

```
# vocalizer_nginx.conf
# the upstream component nginx needs to connect to
upstream django { 
   # server unix:///path/to/your/mysite/mysite.sock; # for a file socket
    server unix://home/pfakanov/vocalizer/vocalizer-backend/vocalizer.sock; # for a web port socket (we'll use this first)
}

# configuration of the server
server {
    # the port your site will be served on
    listen      8000;
    # the domain name it will serve for
    server_name api.songsplitter.com www.api.songsplitter.com; # substitute your machine's IP address or FQDN
    charset     utf-8;

    # max upload size
    client_max_body_size 75M;   # adjust to taste

    # Django media
    location /media  {
        alias /home/pfakanov/vocalizer/vocalizer-backend/vocalizer/media;  # your Django project's media files - amend as required
    }

    location /static {
        alias /home/pfakanov/vocalizer/vocalizer-backend/static; # your Django project's static files - amend as required
    }

    # Finally, send all non-media requests to the Django server.
    location / {
        uwsgi_pass  django;
        include     /home/pfakanov/vocalizer/vocalizer-backend/uwsgi_params; # the uwsgi_params file you installed
    }

}
```

Инструкция, как настроить сертификаты:
https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-18-04


Если все было сделано правильно, то после выполнения команды в папке с проектом сервер запуститься:
```
uwsgi --socket vocalizer.sock --module vocalizer.wsgi --chmod-socket=666
```

После запуска сервер будет доступен на порту `443`. Данные (песни и результат их обработки) хранятся в папке data

##### Миграции

Если в процессе разработки были модифицированы файлы моделей и требуются изменения в базе данных, то нужно сперва создать файлы миграций:

```python manage.py makemigrations vocalizer```

После этого нужно проверить содержимое этих файлов и применить миграции к базе данных, которая хранится в томе `backend-data`. Для этого нужно убедиться, что запущена свежая версия контейнера `backend`, и выполнить команду:

```docker exec -it $(docker ps -q --filter ancestor=backend) python manage.py migrate```

### Фронтенд

В репозитории [vocalizer-frontend](https://gitlab.com/hse-how-to-make-a-startup/projects/vocal-extractor-acapellizer/vocalizer-frontend) лежит фронтенд.

Сейчас фронтенд запущен на [84.201.156.96:3000](http://84.201.156.96:3000/)

Запуск:

```
cd vocalizer-frontend
npm install
npm start
```

### Клиент

В [vocalizer-backend/example_client](https://gitlab.com/hse-how-to-make-a-startup/projects/vocal-extractor-acapellizer/vocalizer-backend/-/tree/master/example_client) лежит пример общения с бэкенд-сервером:

```
cd vocalizer-backend/example_client
pip3 install requests
python3 client.py --addr=https://api.songsplitter.com:443 integration
```
