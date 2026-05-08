"""Database seed script for development data."""
import asyncio
import sys
import uuid
from pathlib import Path

# Ensure the project root is in sys.path so 'backend' package can be found
project_root = Path(__file__).resolve().parents[2]
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from sqlalchemy import select

from backend.core.database import AsyncSessionLocal
from backend.core.enums import OrderStatus, PaymentMethod, PaymentStatus, UserRole
from backend.core.security import hash_password

from backend.modules.usuarios.model import User
from backend.modules.refreshtokens.model import RefreshToken
from backend.modules.categorias.model import Category
from backend.modules.productos.model import Product
from backend.modules.direcciones.model import Address
from backend.modules.pedidos.model import Order, OrderItem
from backend.modules.pagos.model import Payment


async def get_or_create(session, model, defaults=None, **kwargs):
    """Get existing record or create a new one."""
    result = await session.execute(select(model).filter_by(**kwargs))
    instance = result.scalar_one_or_none()
    if instance:
        return instance, False
    if defaults:
        kwargs.update(defaults)
    instance = model(**kwargs)
    session.add(instance)
    await session.flush()
    return instance, True


async def seed_admin(session):
    """Create admin user."""
    admin, created = await get_or_create(
        session,
        User,
        email="admin@foodstore.com",
        defaults={
            "username": "admin",
            "hashed_password": hash_password("admin123"),
            "first_name": "Admin",
            "last_name": "FoodStore",
            "role": UserRole.ADMIN,
            "is_verified": True,
        },
    )
    if created:
        print(f"  ✓ Admin user created: {admin.email}")
    else:
        print(f"  - Admin user already exists: {admin.email}")
    return admin


async def seed_users(session):
    """Create test client user."""
    user, created = await get_or_create(
        session,
        User,
        email="cliente@test.com",
        defaults={
            "username": "cliente1",
            "hashed_password": hash_password("cliente123"),
            "first_name": "Cliente",
            "last_name": "Prueba",
            "phone": "1145678901",
            "role": UserRole.CLIENTE,
            "is_verified": True,
        },
    )
    if created:
        print(f"  ✓ Test user created: {user.email}")
    else:
        print(f"  - Test user already exists: {user.email}")
    return user


async def seed_categories(session):
    """Create product categories."""
    categories_data = [
        {"name": "Bebidas", "description": "Bebidas frías y calientes"},
        {"name": "Comidas Rápidas", "description": "Hamburguesas, lomitos, papas fritas"},
        {"name": "Pizzas", "description": "Pizzas tradicionales y especiales"},
        {"name": "Pastas", "description": "Pastas frescas y secas"},
        {"name": "Postres", "description": "Dulces, helados y tortas"},
        {"name": "Ensaladas", "description": "Ensaladas frescas y bowls"},
    ]
    categories = []
    for cat_data in categories_data:
        cat, created = await get_or_create(session, Category, name=cat_data["name"], defaults=cat_data)
        if created:
            print(f"  ✓ Category created: {cat.name}")
        else:
            print(f"  - Category already exists: {cat.name}")
        categories.append(cat)
    return categories


async def seed_products(session, categories):
    """Create sample products for each category."""
    categories_by_name = {c.name: c for c in categories}

    products_data = {
        "Bebidas": [
            {"name": "Coca Cola 500ml", "price": 1200.00, "description": "Gaseosa Coca Cola 500ml"},
            {"name": "Agua Mineral 500ml", "price": 800.00, "description": "Agua mineral sin gas 500ml"},
            {"name": "Jugo de Naranja", "price": 1500.00, "description": "Jugo de naranja natural 400ml"},
        ],
        "Comidas Rápidas": [
            {"name": "Hamburguesa Clásica", "price": 4500.00, "description": "Hamburguesa con queso, lechuga y tomate"},
            {"name": "Lomito Completo", "price": 5800.00, "description": "Lomito con jamón, queso, huevo y papas"},
            {"name": "Papas Fritas Grandes", "price": 2500.00, "description": "Porción de papas fritas grandes"},
        ],
        "Pizzas": [
            {"name": "Pizza Margarita", "price": 6000.00, "description": "Pizza con mozzarella, tomate y albahaca"},
            {"name": "Pizza Napolitana", "price": 6800.00, "description": "Pizza con mozzarella, tomate y anchoas"},
            {"name": "Pizza Especial", "price": 7500.00, "description": "Pizza con jamón, morrones y aceitunas"},
        ],
        "Pastas": [
            {"name": "Spaghetti Bolognese", "price": 5200.00, "description": "Spaghetti con salsa bolognesa"},
            {"name": "Ravioles de Ricotta", "price": 5800.00, "description": "Ravioles rellenos de ricotta y espinaca"},
            {"name": "Lasagna Clásica", "price": 6500.00, "description": "Lasagna de carne con salsa bechamel"},
        ],
        "Postres": [
            {"name": "Flan Casero", "price": 2500.00, "description": "Flan casero con dulce de leche"},
            {"name": "Helado 2 bochas", "price": 3000.00, "description": "Helado artesanal 2 bochas"},
            {"name": "Torta de Chocolate", "price": 3500.00, "description": "Porción de torta de chocolate"},
        ],
        "Ensaladas": [
            {"name": "Ensalada Caesar", "price": 4200.00, "description": "Lechuga, pollo, crutones, parmesano"},
            {"name": "Ensalada Griega", "price": 4500.00, "description": "Tomate, pepino, oliva, queso feta"},
            {"name": "Bowl Veggie", "price": 4800.00, "description": "Bowl de quinoa, palta y vegetales"},
        ],
    }

    products = []
    for cat_name, cat_products in products_data.items():
        category = categories_by_name.get(cat_name)
        if not category:
            continue
        for prod_data in cat_products:
            product, created = await get_or_create(
                session,
                Product,
                name=prod_data["name"],
                category_id=category.id,
                defaults={
                    "price": prod_data["price"],
                    "description": prod_data.get("description"),
                    "is_available": True,
                },
            )
            if created:
                print(f"  ✓ Product created: {product.name} ({cat_name})")
            else:
                print(f"  - Product already exists: {product.name}")
            products.append(product)
    return products


async def seed_address(session, user):
    """Create test address for the test user."""
    address, created = await get_or_create(
        session,
        Address,
        user_id=user.id,
        street="Av. Siempre Viva",
        defaults={
            "street_number": "742",
            "city": "Buenos Aires",
            "postal_code": "C1000",
            "is_primary": True,
        },
    )
    if created:
        print(f"  ✓ Address created for {user.email}: {address.street} {address.street_number}")
    else:
        print(f"  - Address already exists for {user.email}")
    return address


async def seed_order(session, user, address, products):
    """Create a test order with items and payment."""
    existing_order = await session.execute(
        select(Order).where(Order.user_id == user.id).limit(1)
    )
    if existing_order.scalar_one_or_none():
        print("  - Test order already exists, skipping")
        return

    total = sum(p.price for p in products[:3])  # First 3 products
    order = Order(
        user_id=user.id,
        address_id=address.id,
        status=OrderStatus.CONFIRMADO,
        total=total,
        currency="ARS",
    )
    session.add(order)
    await session.flush()

    for product in products[:3]:
        item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=1,
            unit_price=product.price,
            subtotal=product.price,
        )
        session.add(item)

    payment = Payment(
        order_id=order.id,
        payment_method=PaymentMethod.MERCADOPAGO,
        status=PaymentStatus.APROBADO,
        amount=total,
        currency="ARS",
    )
    session.add(payment)
    await session.flush()
    print(f"  ✓ Test order created: {order.id} (${total:.2f})")


async def main():
    """Run all seed functions in order."""
    print("🌱 Seeding database...")
    async with AsyncSessionLocal() as session:
        print("\n  ── Admin User ──")
        await seed_admin(session)
        await session.commit()

        print("\n  ── Test Users ──")
        test_user = await seed_users(session)
        await session.commit()

        print("\n  ── Categories ──")
        categories = await seed_categories(session)
        await session.commit()

        print("\n  ── Products ──")
        products = await seed_products(session, categories)
        await session.commit()

        print("\n  ── Addresses ──")
        address = await seed_address(session, test_user)
        await session.commit()

        print("\n  ── Orders ──")
        await seed_order(session, test_user, address, products)
        await session.commit()

    print("\n✅ Seed completed successfully!")


if __name__ == "__main__":
    asyncio.run(main())
