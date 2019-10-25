import graphene
from graphene_django.types import DjangoObjectType

from django.contrib.auth.models import User

from .models import SelectedHero, Hero


class SelectedHeroType(DjangoObjectType):
    class Meta:
        model = SelectedHero


class UserType(DjangoObjectType):
    class Meta:
        model = User

    selected_heroes = graphene.List(SelectedHeroType)

    def resolve_selected_heroes(self, info, **kwargs):
        return self.selected_heroes.all()


class HeroType(DjangoObjectType):
    class Meta:
        model = Hero


class Query(graphene.ObjectType):
    viewer = graphene.Field(UserType)

    def resolve_viewer(self, info, **kwargs):
        return info.context.user
