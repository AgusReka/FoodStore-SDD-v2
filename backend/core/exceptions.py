"""Domain exception classes for consistent error handling."""


class NotFoundError(Exception):
    def __init__(self, detail: str = "Resource not found"):
        self.detail = detail
        self.code = "NOT_FOUND"


class ConflictError(Exception):
    def __init__(self, detail: str):
        self.detail = detail
        self.code = "CONFLICT"


class ForbiddenError(Exception):
    def __init__(self, detail: str = "Forbidden"):
        self.detail = detail
        self.code = "FORBIDDEN"


class UnauthorizedError(Exception):
    def __init__(self, detail: str = "Unauthorized"):
        self.detail = detail
        self.code = "UNAUTHORIZED"


class ValidationError(Exception):
    def __init__(self, detail: str):
        self.detail = detail
        self.code = "VALIDATION_ERROR"
