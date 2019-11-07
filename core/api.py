import graphene
from graphene_django.types import DjangoObjectType

from authentication.models import SteamUser
from .models import SelectedHero, Hero


class HeroType(DjangoObjectType):
    class Meta:
        model = Hero


class SelectedHeroType(DjangoObjectType):
    class Meta:
        model = SelectedHero


class UserType(DjangoObjectType):
    class Meta:
        model = SteamUser

    selected_heroes = graphene.List(SelectedHeroType)

    @staticmethod
    def resolve_selected_heroes(root, info, **kwargs):
        return root.selected_heroes.order_by('-id')


class UpdateOrCreateSelectedHero(graphene.Mutation):
    class Arguments:
        hero_id = graphene.ID()
        matchup_ids = graphene.List(graphene.ID)

    selected_hero = graphene.Field(SelectedHeroType)

    def mutate(root, info, hero_id, matchup_ids):
        selected_hero, created = SelectedHero.objects.get_or_create(
            user=info.context.user,
            hero_id=hero_id,
        )

        if created and not matchup_ids:
            matchup_ids = (
                Hero.objects
                    .lane_occupants('mid')
                    .values_list('id', flat=True)
            )

        selected_hero.matchups.set(matchup_ids)
        return UpdateOrCreateSelectedHero(selected_hero=selected_hero)


class DeleteSelectedHero(graphene.Mutation):
    class Arguments:
        selected_hero_id = graphene.ID()

    ok = graphene.Boolean()

    def mutate(root, info, selected_hero_id):
        selected_hero = SelectedHero.objects.get(pk=selected_hero_id)

        if selected_hero.user != info.context.user:
            return DeleteSelectedHero(ok=False)

        selected_hero.delete()
        return DeleteSelectedHero(ok=True)


class Mutations(graphene.ObjectType):
    update_or_create_selected_hero = UpdateOrCreateSelectedHero.Field()
    delete_selected_hero = DeleteSelectedHero.Field()


class Query(graphene.ObjectType):
    viewer = graphene.Field(UserType)
    all_heroes = graphene.List(HeroType)
    midlaners = graphene.List(HeroType)

    def resolve_viewer(self, info, **kwargs):
        user = info.context.user
        if user.is_anonymous:
            return None
        return user

    def resolve_all_heroes(self, info, **kwargs):
        return Hero.objects.all()

    def resolve_midlaners(self, info, **kwargs):
        return Hero.objects.lane_occupants('mid')
