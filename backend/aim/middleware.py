from django.http import Http404
from usercompanyrelation.models import UserCompanyRelation


class CompanyMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            print("hhhhhhhhhhhhhhhhhh")
            try:
                relation = UserCompanyRelation.objects.select_related("company").get(
                    user=request.user
                )
                request.company = relation.company
                request.user_company_relation = relation
            except UserCompanyRelation.DoesNotExist:
                raise Http404("No company associated with this user")
        else:
            request.company = None
            request.user_company_relation = None

        response = self.get_response(request)
        return response
