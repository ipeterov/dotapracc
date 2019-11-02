FROM python:3.8.0-slim
ENV PYTHONUNBUFFERED 1

RUN apt-get update
RUN apt-get install -y curl

RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get install -y nodejs
RUN npm install --global webpack webpack-cli

RUN mkdir /code
WORKDIR /code

COPY requirements.txt /code/
COPY package.json /code/
COPY package-lock.json /code/
COPY webpack.config.js /code/
COPY .babelrc /code/

RUN pip install -r requirements.txt
RUN npm install

COPY . /code/

RUN npm run build

RUN python dotapracc/manage.py collectstatic --no-input --settings dotapracc.settings.prod
