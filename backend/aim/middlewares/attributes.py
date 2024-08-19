class CustomAttrsMiddleware:
    """Adding custom attrs to WSGI request object."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not hasattr(request, "li_relation"):
            request.li_relation = None
        if not hasattr(request, "company"):
            request.company = None
        if not hasattr(request, "role"):
            request.role = None

        response = self.get_response(request)
        return response
