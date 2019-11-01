FROM nikolaik/python-nodejs:latest
ENV PYTHONUNBUFFERED 1

RUN mkdir /code
WORKDIR /code

COPY requirements.txt /code/
RUN pip install -r requirements.txt

COPY . /code/

RUN npm run build
RUN python dotapracc/manage.py collectstatic --no-input --settings dotapracc.settings.prod

EXPOSE 8000
EXPOSE 8001
