from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('refs/', views.index, name='refs'),
    path('about/', views.index, name='about'),
    path('logout', views.logout_view, name='logout'),
]
