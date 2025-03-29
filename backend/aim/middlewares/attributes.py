from usercompanyrelation.models import UserCompanyRelation


class CustomAttrsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):

        if not hasattr(request, "li_relation"):
            request.li_relation = None
        if not hasattr(request, "company"):
            request.company = None
        if not hasattr(request, "role"):
            request.role = None

        # If user is authenticated, try to set the company
        if request.user.is_authenticated:
            try:

                relation = UserCompanyRelation.objects.select_related("company").get(
                    user=request.user
                )
                request.company = relation.company
                request.role = relation.role

            except UserCompanyRelation.DoesNotExist:
                print(f"No company relation found for user {request.user}")

        response = self.get_response(request)
        return response
