FROM nikolaik/python-nodejs:latest
ENV PYTHONUNBUFFERED 1

RUN mkdir /code
WORKDIR /code

COPY requirements.txt /code/
RUN pip install -r requirements.txt

COPY . /code/

RUN npm install --global webpack
RUN npm run build
RUN python dotapracc/manage.py collectstatic --no-input --settings dotapracc.settings.prod