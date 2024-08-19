# DRF
# DRF
from aim.permissions import IsLoggedIn
from rest_framework import exceptions
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated


class DisablePUTMethod:
    """This view overrides the put method and returns 405.\
         This is then applied on update views to stop PUT."""

    def put(self, request, *args, **kwargs):
        raise exceptions.MethodNotAllowed("PUT")


class DisablePATCHMethod:
    """This view overrides the patch method and returns 405. This is then \
        applied on update views to stop PATCH."""

    def patch(self, request, *args, **kwargs):
        raise exceptions.MethodNotAllowed("PATCH")


class PublicViewMixin:
    """This mixin is used to make any view public. That means it removes \
        authentication and permission from view."""

    authentication_classes = ()
    permission_classes = (AllowAny,)


class IsAdminPermissionMixinUser:
    """This mixin is used wherever admin permission is required."""

    permission_classes = [
        IsAuthenticated,
        IsLoggedIn,
    ]

    def get_permissions(self):
        """Set custom permissions for each action."""
        if self.action in [
            "update",
            "list",
            "retrieve",
            "invite",
            "partial_update",
            "info",
        ]:
            permission_classes = [
                IsAuthenticated,
                IsLoggedIn,
            ]
        elif self.action in ["create"]:
            permission_classes = [
                AllowAny,
            ]
        return permission_classes

    def has_permission(self, request, view):
        """Check if the user has the required permissions."""
        return super().has_permission(request, view)


class IsAdminPermissionMixin:
    """This mixin is used wherever admin permission is required."""

    permission_classes = [
        IsAuthenticated,
        IsLoggedIn,
    ]


class IsAuthenticatedPermissionMixin:
    """This mixin is used wherever IsAuthenticated permission is required."""

    permission_classes = [
        IsAuthenticated,
    ]


class AllowBulkCreateMixin:
    """This mixin calls the serializer with 'many' argument. Which then \
        considers the input to be a list instead of a\
    dict."""

    def get_serializer(self, *args, **kwargs):
        kwargs["many"] = True
        return super().get_serializer(*args, **kwargs)


class StatusCode200Mixin:
    """This mixin overrides the response status code to 200 of any API \
        inherited from DRF views."""

    def dispatch(self, request, *args, **kwargs):
        res = super().dispatch(request, *args, **kwargs)
        if res.status_code > 300:
            return res
        res.status_code = 200
        return res


class StatusCode202Mixin:
    """This mixin overrides the response status code to 202 of any API \
        inherited from DRF views."""

    def dispatch(self, request, *args, **kwargs):
        res = super().dispatch(request, *args, **kwargs)
        if res.status_code > 300:
            return res
        res.status_code = 202
        return res


class StatusCode204Mixin:
    """This mixin overrides the response status code to 204 of any API \
        inherited from DRF views."""

    def dispatch(self, request, *args, **kwargs):
        res = super().dispatch(request, *args, **kwargs)
        if res.status_code > 300:
            return res
        res.status_code = 204
        res.data = None
        return res


class IDLookupURLKwarg:
    """This mixin overrides the lookup url kwarg to accept ID rather than \
        the default pk."""

    lookup_url_kwarg = "id"


class Pagination:
    """This mixin adds Pagination to generic views wherever needed."""

    pagination_class = PageNumberPagination


class AddQuerysetToSerializerContextMixin:
    """This mixin is used to add queryset into the context of serializer."""

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"qs": self.get_queryset()})
        return context


class AddObjectToSerializerContextMixin:
    """Serializer context class for serializer."""

    def get_serializer_context(self):
        data = super().get_serializer_context()
        data["object"] = self.get_object()
        return data


class FileUploadParsersMixin:
    """This mixin is used in all those views which handle file uploads. \
        It simply set parser_classes to MultiPart."""

    parser_classes = [MultiPartParser, FormParser]
