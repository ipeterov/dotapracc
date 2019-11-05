from django.conf import settings
from django.contrib.auth import logout
from django.shortcuts import render, redirect


def index(request):
    return render(
        request,
        'frontend/index.html',
        context={'settings': settings},
    )


def logout_view(request):
    logout(request)
    return redirect('index')
