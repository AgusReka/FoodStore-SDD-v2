"""Cocina (Kitchen Display System) module."""

__all__ = ["router"]


def __getattr__(name):
    if name == "router":
        from backend.modules.cocina.router import router
        return router
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
