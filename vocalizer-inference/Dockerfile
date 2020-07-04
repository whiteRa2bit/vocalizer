FROM python:3.6

RUN apt-get update && apt-get install -y ffmpeg libsndfile1
RUN pip install tensorflow==1.15.0
RUN pip install spleeter
RUN pip install pika
RUN pip install requests


ENV MODEL_PATH /model
RUN mkdir -p /model/4stems
RUN wget -O - https://github.com/deezer/spleeter/releases/download/v1.4.0/4stems.tar.gz | tar zx -C /model/4stems

COPY . /app
WORKDIR /app
EXPOSE 5000
ENTRYPOINT ["python", "worker.py"]
