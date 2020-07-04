FROM python:3.6
ENV PYTHONUNBUFFERED 1

RUN mkdir /app
WORKDIR /app

COPY requirements.txt /app
RUN pip install -r requirements.txt
RUN pip install django-extensions Werkzeug pyOpenSSL
COPY . /app

VOLUME /data
ENV DATA_ROOT=/data

ENTRYPOINT ["python", "manage.py", "runserver_plus", "--cert-file=/ssl/cert.pem", "--key-file=/ssl/key.pem", "0.0.0.0:443"]
