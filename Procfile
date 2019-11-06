release: python manage.py migrate
web: daphne dotapracc.asgi:application --port $PORT --bind 0.0.0.0 -v2
worker: celery -A dotapracc worker --beat --scheduler django_celery_beat.schedulers:DatabaseScheduler
