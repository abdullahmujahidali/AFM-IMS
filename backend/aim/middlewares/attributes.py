class CustomAttrsMiddleware:
    """Adding custom attrs to WSGI request object."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.li_relation = None
        request.company = None
        request.role = None
        response = self.get_response(request)
        return response
