"""Permission enum and role-to-permissions mapping for RBAC."""

import enum

from backend.core.enums import UserRole


class Permission(str, enum.Enum):
    PRODUCT_LIST = "product:list"
    PRODUCT_READ = "product:read"
    PRODUCT_CREATE = "product:create"
    PRODUCT_UPDATE = "product:update"
    PRODUCT_DELETE = "product:delete"

    CATEGORY_LIST = "category:list"
    CATEGORY_READ = "category:read"
    CATEGORY_CREATE = "category:create"
    CATEGORY_UPDATE = "category:update"
    CATEGORY_DELETE = "category:delete"

    USER_LIST = "user:list"
    USER_READ = "user:read"
    USER_CREATE = "user:create"
    USER_UPDATE = "user:update"
    USER_DELETE = "user:delete"
    USER_CHANGE_ROLE = "user:change_role"

    ORDER_LIST_ALL = "order:list_all"
    ORDER_READ_ANY = "order:read_any"
    ORDER_UPDATE_STATUS = "order:update_status"

    PAYMENT_LIST = "payment:list"
    PAYMENT_READ = "payment:read"
    PAYMENT_CREATE = "payment:create"
    PAYMENT_UPDATE_STATUS = "payment:update_status"


ROLE_PERMISSIONS: dict[UserRole, set[Permission]] = {
    UserRole.ADMIN: {
        Permission.PRODUCT_LIST,
        Permission.PRODUCT_READ,
        Permission.PRODUCT_CREATE,
        Permission.PRODUCT_UPDATE,
        Permission.PRODUCT_DELETE,
        Permission.CATEGORY_LIST,
        Permission.CATEGORY_READ,
        Permission.CATEGORY_CREATE,
        Permission.CATEGORY_UPDATE,
        Permission.CATEGORY_DELETE,
        Permission.USER_LIST,
        Permission.USER_READ,
        Permission.USER_CREATE,
        Permission.USER_UPDATE,
        Permission.USER_DELETE,
        Permission.USER_CHANGE_ROLE,
        Permission.ORDER_LIST_ALL,
        Permission.ORDER_READ_ANY,
        Permission.ORDER_UPDATE_STATUS,
        Permission.PAYMENT_LIST,
        Permission.PAYMENT_READ,
        Permission.PAYMENT_CREATE,
        Permission.PAYMENT_UPDATE_STATUS,
    },
    UserRole.CLIENTE: set(),
}
