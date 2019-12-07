from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('about/', views.index, name='about'),
    path('logout', views.logout_view, name='logout'),
    path('refs/', views.index, name='refs'),
    path('wizard/', views.index, name='wizard'),
]
