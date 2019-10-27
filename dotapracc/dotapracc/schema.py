import graphene

from core.api import Query as CoreQuery, Mutations as CoreMutations


class Query(CoreQuery):
    pass


class Mutations(CoreMutations):
    pass


schema = graphene.Schema(query=Query, mutation=Mutations)
