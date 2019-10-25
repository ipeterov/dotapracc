import graphene

from core.api import Query as CoreQuery


class Query(CoreQuery):
    pass


schema = graphene.Schema(query=Query)
