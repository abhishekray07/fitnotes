FROM python:3

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -

RUN apt-get update -y && \
    apt-get install -y libmemcached-dev nodejs

COPY . app/
WORKDIR /app

ENV FLASK_APP /app/autoapp.py
ENV FLASK_DEBUG 0

RUN pip install -r requirements.txt
RUN npm run build
CMD flask run --host=0.0.0.0
