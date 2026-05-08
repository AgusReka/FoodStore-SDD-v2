"""Auth repository — delegates to UserRepository."""
# Auth module uses User model from usuarios module.
# All user queries go through UserRepository.
from backend.modules.usuarios.repository import UserRepository
