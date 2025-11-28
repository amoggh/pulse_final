FROM python:3.11-slim

WORKDIR /worker

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /worker/requirements.txt
RUN pip install --no-cache-dir -r /worker/requirements.txt

COPY . /worker
COPY /api /app

CMD ["python", "main.py"]


