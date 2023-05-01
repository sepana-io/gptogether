FROM python:3.8-slim
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
CMD ["gunicorn","--bind","0.0.0.0:9090","run:app","-w","2", "--timeout", "120", "--worker-class","uvicorn.workers.UvicornWorker"]
