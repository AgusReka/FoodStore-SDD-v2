"""Database seed script for development data."""
from datetime import datetime, timezone, timedelta
import asyncio
import sys
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
from backend.modules.ingredientes.model import Ingredient, ProductIngredient
from backend.modules.direcciones.model import Address
from backend.modules.pedidos.model import Order, OrderHistory, OrderItem
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
        print(f"  [OK] Admin user created: {admin.email}")
    else:
        print(f"  [  ] Admin user already exists: {admin.email}")
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
        print(f"  [OK] Test user created: {user.email}")
    else:
        print(f"  [  ] Test user already exists: {user.email}")
    return user


async def seed_cocina(session):
    """Create test kitchen user."""
    user, created = await get_or_create(
        session,
        User,
        email="cocina@foodstore.com",
        defaults={
            "username": "cocina1",
            "hashed_password": hash_password("cocina123"),
            "first_name": "Cocinero",
            "last_name": "FoodStore",
            "role": UserRole.COCINA,
            "is_verified": True,
        },
    )
    if created:
        print(f"  [OK] Kitchen user created: {user.email}")
    else:
        print(f"  [  ] Kitchen user already exists: {user.email}")
    return user


async def seed_pedidos(session):
    """Create test orders manager user."""
    user, created = await get_or_create(
        session,
        User,
        email="pedidos@foodstore.com",
        defaults={
            "username": "pedidos1",
            "hashed_password": hash_password("pedidos123"),
            "first_name": "Gestor",
            "last_name": "Pedidos",
            "role": UserRole.PEDIDOS,
            "is_verified": True,
        },
    )
    if created:
        print(f"  [OK] Pedidos user created: {user.email}")
    else:
        print(f"  [  ] Pedidos user already exists: {user.email}")
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
            print(f"  [OK] Category created: {cat.name}")
        else:
            print(f"  [  ] Category already exists: {cat.name}")
        categories.append(cat)
    return categories


async def seed_ingredients(session):
    """Create sample ingredients with stock values."""
    ingredients_data = [
        {"name": "Pan de hamburguesa", "description": "Pan para hamburguesa y lomito", "unit": "unidades", "stock_actual": 50, "stock_minimo": 10},
        {"name": "Carne picada", "description": "Carne vacuna picada", "unit": "gramos", "stock_actual": 5000, "stock_minimo": 1000},
        {"name": "Queso mozzarella", "description": "Queso mozzarella", "unit": "gramos", "stock_actual": 3000, "stock_minimo": 500},
        {"name": "Lechuga", "description": "Lechuga fresca", "unit": "unidades", "stock_actual": 30, "stock_minimo": 10},
        {"name": "Tomate", "description": "Tomate fresco", "unit": "unidades", "stock_actual": 40, "stock_minimo": 10},
        {"name": "Masa de pizza", "description": "Masa para pizza", "unit": "unidades", "stock_actual": 20, "stock_minimo": 5},
        {"name": "Albahaca", "description": "Albahaca fresca", "unit": "gramos", "stock_actual": 200, "stock_minimo": 50},
        {"name": "Jamón", "description": "Jamón cocido", "unit": "gramos", "stock_actual": 2000, "stock_minimo": 500},
        {"name": "Huevo", "description": "Huevo fresco", "unit": "unidades", "stock_actual": 60, "stock_minimo": 20},
        {"name": "Papas", "description": "Papas frescas", "unit": "gramos", "stock_actual": 10000, "stock_minimo": 2000},
        {"name": "Cebolla", "description": "Cebolla fresca", "unit": "unidades", "stock_actual": 30, "stock_minimo": 10},
        {"name": "Morrones", "description": "Morrones asados", "unit": "unidades", "stock_actual": 20, "stock_minimo": 5},
        {"name": "Pasta seca", "description": "Pasta seca (spaghetti, ravioles, lasagna)", "unit": "gramos", "stock_actual": 5000, "stock_minimo": 1000},
        {"name": "Ricotta", "description": "Ricotta para rellenos", "unit": "gramos", "stock_actual": 2000, "stock_minimo": 500},
        {"name": "Dulce de leche", "description": "Dulce de leche", "unit": "gramos", "stock_actual": 2000, "stock_minimo": 500},
    ]
    ingredients = {}
    for ing_data in ingredients_data:
        name = ing_data.pop("name")
        ing, created = await get_or_create(
            session,
            Ingredient,
            name=name,
            defaults=ing_data,
        )
        if created:
            print(f"  [OK] Ingredient created: {ing.name}")
        else:
            print(f"  [  ] Ingredient already exists: {ing.name}")
        ingredients[name] = ing
    return ingredients


async def seed_products(session, categories):
    """Create sample products for each category."""
    categories_by_name = {c.name: c for c in categories}

    products_data = {
        "Bebidas": [
            {"name": "Coca Cola 500ml", "price": 1200.00, "description": "Gaseosa Coca Cola 500ml", "stock_cantidad": 100},
            {"name": "Agua Mineral 500ml", "price": 800.00, "description": "Agua mineral sin gas 500ml", "stock_cantidad": 100},
            {"name": "Jugo de Naranja", "price": 1500.00, "description": "Jugo de naranja natural 400ml", "stock_cantidad": 50},
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
            {"name": "Flan Casero", "price": 2500.00, "description": "Flan casero con dulce de leche", "stock_cantidad": 20},
            {"name": "Helado 2 bochas", "price": 3000.00, "description": "Helado artesanal 2 bochas", "stock_cantidad": 30},
            {"name": "Torta de Chocolate", "price": 3500.00, "description": "Porción de torta de chocolate", "stock_cantidad": 15},
        ],
        "Ensaladas": [
            {"name": "Ensalada Caesar", "price": 4200.00, "description": "Lechuga, pollo, crutones, parmesano", "stock_cantidad": 20},
            {"name": "Ensalada Griega", "price": 4500.00, "description": "Tomate, pepino, oliva, queso feta", "stock_cantidad": 20},
            {"name": "Bowl Veggie", "price": 4800.00, "description": "Bowl de quinoa, palta y vegetales", "stock_cantidad": 15},
        ],
    }

    products_by_name = {}
    for cat_name, cat_products in products_data.items():
        category = categories_by_name.get(cat_name)
        if not category:
            continue
        for prod_data in cat_products:
            name = prod_data.pop("name")
            product, created = await get_or_create(
                session,
                Product,
                name=name,
                category_id=category.id,
                defaults={
                    "price": prod_data.get("price"),
                    "description": prod_data.get("description"),
                    "stock_cantidad": prod_data.get("stock_cantidad"),
                    "is_available": True,
                },
            )
            if created:
                print(f"  [OK] Product created: {product.name} ({cat_name})")
            else:
                print(f"  [  ] Product already exists: {product.name}")
            products_by_name[name] = product
    return products_by_name


async def seed_product_ingredients(session, products, ingredients):
    """Link composite products to their ingredients with quantities."""
    relationships = {
        "Hamburguesa Clásica": [
            ("Pan de hamburguesa", 2),
            ("Carne picada", 200),
            ("Queso mozzarella", 50),
            ("Lechuga", 1),
            ("Tomate", 2),
        ],
        "Lomito Completo": [
            ("Pan de hamburguesa", 2),
            ("Carne picada", 250),
            ("Jamón", 100),
            ("Queso mozzarella", 50),
            ("Huevo", 2),
            ("Papas", 200),
        ],
        "Papas Fritas Grandes": [
            ("Papas", 500),
        ],
        "Pizza Margarita": [
            ("Masa de pizza", 1),
            ("Queso mozzarella", 200),
            ("Tomate", 3),
            ("Albahaca", 10),
        ],
        "Pizza Napolitana": [
            ("Masa de pizza", 1),
            ("Queso mozzarella", 200),
            ("Tomate", 3),
        ],
        "Pizza Especial": [
            ("Masa de pizza", 1),
            ("Queso mozzarella", 200),
            ("Jamón", 100),
            ("Morrones", 2),
        ],
        "Spaghetti Bolognese": [
            ("Pasta seca", 400),
            ("Carne picada", 300),
            ("Tomate", 3),
        ],
        "Ravioles de Ricotta": [
            ("Pasta seca", 400),
            ("Ricotta", 200),
        ],
        "Lasagna Clásica": [
            ("Pasta seca", 400),
            ("Carne picada", 300),
            ("Queso mozzarella", 150),
        ],
    }

    count = 0
    for product_name, ingredient_list in relationships.items():
        product = products.get(product_name)
        if not product:
            print(f"  ! Product not found: {product_name}")
            continue
        for ing_name, qty in ingredient_list:
            ingredient = ingredients.get(ing_name)
            if not ingredient:
                print(f"  ! Ingredient not found: {ing_name}")
                continue
            pi, created = await get_or_create(
                session,
                ProductIngredient,
                product_id=product.id,
                ingredient_id=ingredient.id,
                defaults={"quantity": qty},
            )
            if created:
                count += 1
    if count > 0:
        print(f"  [OK] {count} product-ingredient relationships created")
    else:
        print("  [  ] All product-ingredient relationships already exist")


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
        print(f"  [OK] Address created for {user.email}: {address.street} {address.street_number}")
    else:
        print(f"  [  ] Address already exists for {user.email}")
    return address


async def _create_order_with_history(
    session, user, address, products, status, payment_status, product_indices, order_idx, history=None
):
    """Helper to create an order with items, optional payment, and history entries."""
    product_list = list(products.values())
    selected = [product_list[i] for i in product_indices]
    total = sum(p.price for p in selected)

    order = Order(
        user_id=user.id,
        address_id=address.id,
        status=status,
        total=total,
        currency="ARS",
    )
    session.add(order)
    await session.flush()

    for product in selected:
        item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=1,
            unit_price=product.price,
            subtotal=product.price,
        )
        session.add(item)

    if payment_status:
        payment = Payment(
            order_id=order.id,
            payment_method=PaymentMethod.MERCADOPAGO,
            status=payment_status,
            amount=total,
            currency="ARS",
        )
        session.add(payment)

    if history:
        for entry in history:
            h = OrderHistory(
                order_id=order.id,
                from_status=entry["from"],
                to_status=entry["to"],
                reason=entry.get("reason"),
            )
            session.add(h)

    await session.flush()
    print(f"  [OK] Order #{order_idx}: status={status.value}, items={len(selected)}, total=${total:.2f}")
    return order


async def seed_orders(session, user, address, products):
    """Create multiple test orders in different statuses with history entries."""
    # Check if orders already exist
    existing = await session.execute(
        select(Order).where(Order.user_id == user.id)
    )
    existing_orders = existing.scalars().all()
    if existing_orders:
        print(f"  [  ] {len(existing_orders)} orders already exist, skipping")
        return

    # Order 1: PENDIENTE — just created, no payment yet
    await _create_order_with_history(
        session, user, address, products,
        status=OrderStatus.PENDIENTE,
        payment_status=None,
        product_indices=[0, 1],  # Coca Cola, Agua Mineral
        order_idx=1,
        history=None,
    )

    # Order 2: CONFIRMADO — paid, waiting to be prepared
    await _create_order_with_history(
        session, user, address, products,
        status=OrderStatus.CONFIRMADO,
        payment_status=PaymentStatus.APROBADO,
        product_indices=[4, 5],  # Lomito, Papas Fritas
        order_idx=2,
        history=[
            {"from": OrderStatus.PENDIENTE, "to": OrderStatus.CONFIRMADO, "reason": "Pago aprobado"},
        ],
    )

    # Order 3: PREPARANDO — being cooked
    await _create_order_with_history(
        session, user, address, products,
        status=OrderStatus.PREPARANDO,
        payment_status=PaymentStatus.APROBADO,
        product_indices=[6, 8],  # Pizza Margarita, Pizza Especial
        order_idx=3,
        history=[
            {"from": OrderStatus.PENDIENTE, "to": OrderStatus.CONFIRMADO, "reason": "Pago aprobado"},
            {"from": OrderStatus.CONFIRMADO, "to": OrderStatus.PREPARANDO, "reason": "Cocinero asignado"},
        ],
    )

    # Order 4: ENVIADO — on the way
    await _create_order_with_history(
        session, user, address, products,
        status=OrderStatus.ENVIADO,
        payment_status=PaymentStatus.APROBADO,
        product_indices=[12, 13, 14],  # Caesar, Griega, Bowl
        order_idx=4,
        history=[
            {"from": OrderStatus.PENDIENTE, "to": OrderStatus.CONFIRMADO, "reason": "Pago aprobado"},
            {"from": OrderStatus.CONFIRMADO, "to": OrderStatus.PREPARANDO, "reason": "Cocinero asignado"},
            {"from": OrderStatus.PREPARANDO, "to": OrderStatus.ENVIADO, "reason": "Pedido en camino"},
        ],
    )

    # Order 5: ENTREGADO — completed
    await _create_order_with_history(
        session, user, address, products,
        status=OrderStatus.ENTREGADO,
        payment_status=PaymentStatus.APROBADO,
        product_indices=[2, 3],  # Hamburguesa, Pizza Napolitana
        order_idx=5,
        history=[
            {"from": OrderStatus.PENDIENTE, "to": OrderStatus.CONFIRMADO, "reason": "Pago aprobado"},
            {"from": OrderStatus.CONFIRMADO, "to": OrderStatus.PREPARANDO, "reason": "Cocinero asignado"},
            {"from": OrderStatus.PREPARANDO, "to": OrderStatus.ENVIADO, "reason": "Pedido en camino"},
            {"from": OrderStatus.ENVIADO, "to": OrderStatus.ENTREGADO, "reason": "Entregado al cliente"},
        ],
    )

    # Order 6: CANCELADO — was confirmed then cancelled
    await _create_order_with_history(
        session, user, address, products,
        status=OrderStatus.CANCELADO,
        payment_status=PaymentStatus.REEMBOLSADO,
        product_indices=[10, 11],  # Spaghetti, Ravioles
        order_idx=6,
        history=[
            {"from": OrderStatus.PENDIENTE, "to": OrderStatus.CONFIRMADO, "reason": "Pago aprobado"},
            {"from": OrderStatus.CONFIRMADO, "to": OrderStatus.CANCELADO, "reason": "Cancelado por el cliente"},
        ],
    )


async def seed_old_orders(session, user, address, products):
    """Create old-dated orders for testing date filters (last 90 days)."""
    now = datetime.now(timezone.utc)

    # Check if old orders already exist (orders older than 7 days)
    week_ago = now - timedelta(days=7)
    existing = await session.execute(
        select(Order).where(
            Order.user_id == user.id,
            Order.created_at <= week_ago
        )
    )
    existing_orders = existing.scalars().all()
    if existing_orders:
        print(f"  [  ] {len(existing_orders)} old orders already exist, skipping")
        return

    product_list = list(products.values())

    old_orders = [
        {
            "days_ago": 90,
            "status": OrderStatus.ENTREGADO,
            "payment_status": PaymentStatus.APROBADO,
            "product_indices": [0, 2],  # Coca Cola, Hamburguesa
            "history": [
                {"from": OrderStatus.PENDIENTE, "to": OrderStatus.CONFIRMADO, "reason": "Pago aprobado"},
                {"from": OrderStatus.CONFIRMADO, "to": OrderStatus.PREPARANDO, "reason": "Cocinero asignado"},
                {"from": OrderStatus.PREPARANDO, "to": OrderStatus.ENVIADO, "reason": "Pedido en camino"},
                {"from": OrderStatus.ENVIADO, "to": OrderStatus.ENTREGADO, "reason": "Entregado al cliente"},
            ],
        },
        {
            "days_ago": 75,
            "status": OrderStatus.ENTREGADO,
            "payment_status": PaymentStatus.APROBADO,
            "product_indices": [6, 7],  # Pizza Margarita, Pizza Napolitana
            "history": [
                {"from": OrderStatus.PENDIENTE, "to": OrderStatus.CONFIRMADO, "reason": "Pago aprobado"},
                {"from": OrderStatus.CONFIRMADO, "to": OrderStatus.PREPARANDO, "reason": "Cocinero asignado"},
                {"from": OrderStatus.PREPARANDO, "to": OrderStatus.ENVIADO, "reason": "Pedido en camino"},
                {"from": OrderStatus.ENVIADO, "to": OrderStatus.ENTREGADO, "reason": "Entregado al cliente"},
            ],
        },
        {
            "days_ago": 60,
            "status": OrderStatus.CANCELADO,
            "payment_status": PaymentStatus.REEMBOLSADO,
            "product_indices": [3, 5],  # Jugo, Lomito
            "history": [
                {"from": OrderStatus.PENDIENTE, "to": OrderStatus.CONFIRMADO, "reason": "Pago aprobado"},
                {"from": OrderStatus.CONFIRMADO, "to": OrderStatus.CANCELADO, "reason": "Cancelado por el cliente"},
            ],
        },
        {
            "days_ago": 50,
            "status": OrderStatus.ENTREGADO,
            "payment_status": PaymentStatus.APROBADO,
            "product_indices": [9, 10, 11],  # Flan, Helado, Torta
            "history": [
                {"from": OrderStatus.PENDIENTE, "to": OrderStatus.CONFIRMADO, "reason": "Pago aprobado"},
                {"from": OrderStatus.CONFIRMADO, "to": OrderStatus.PREPARANDO, "reason": "Cocinero asignado"},
                {"from": OrderStatus.PREPARANDO, "to": OrderStatus.ENVIADO, "reason": "Pedido en camino"},
                {"from": OrderStatus.ENVIADO, "to": OrderStatus.ENTREGADO, "reason": "Entregado al cliente"},
            ],
        },
        {
            "days_ago": 45,
            "status": OrderStatus.ENTREGADO,
            "payment_status": PaymentStatus.APROBADO,
            "product_indices": [12, 13],  # Caesar, Griega
            "history": [
                {"from": OrderStatus.PENDIENTE, "to": OrderStatus.CONFIRMADO, "reason": "Pago aprobado"},
                {"from": OrderStatus.CONFIRMADO, "to": OrderStatus.PREPARANDO, "reason": "Cocinero asignado"},
                {"from": OrderStatus.PREPARANDO, "to": OrderStatus.ENVIADO, "reason": "Pedido en camino"},
                {"from": OrderStatus.ENVIADO, "to": OrderStatus.ENTREGADO, "reason": "Entregado al cliente"},
            ],
        },
        {
            "days_ago": 30,
            "status": OrderStatus.CANCELADO,
            "payment_status": PaymentStatus.REEMBOLSADO,
            "product_indices": [1, 4],  # Agua, Papas Fritas
            "history": [
                {"from": OrderStatus.PENDIENTE, "to": OrderStatus.CONFIRMADO, "reason": "Pago aprobado"},
                {"from": OrderStatus.CONFIRMADO, "to": OrderStatus.CANCELADO, "reason": "Cancelado por el cliente"},
            ],
        },
        {
            "days_ago": 20,
            "status": OrderStatus.ENTREGADO,
            "payment_status": PaymentStatus.APROBADO,
            "product_indices": [8],  # Pizza Especial
            "history": [
                {"from": OrderStatus.PENDIENTE, "to": OrderStatus.CONFIRMADO, "reason": "Pago aprobado"},
                {"from": OrderStatus.CONFIRMADO, "to": OrderStatus.PREPARANDO, "reason": "Cocinero asignado"},
                {"from": OrderStatus.PREPARANDO, "to": OrderStatus.ENVIADO, "reason": "Pedido en camino"},
                {"from": OrderStatus.ENVIADO, "to": OrderStatus.ENTREGADO, "reason": "Entregado al cliente"},
            ],
        },
        {
            "days_ago": 10,
            "status": OrderStatus.ENTREGADO,
            "payment_status": PaymentStatus.APROBADO,
            "product_indices": [14],  # Bowl
            "history": [
                {"from": OrderStatus.PENDIENTE, "to": OrderStatus.CONFIRMADO, "reason": "Pago aprobado"},
                {"from": OrderStatus.CONFIRMADO, "to": OrderStatus.PREPARANDO, "reason": "Cocinero asignado"},
                {"from": OrderStatus.PREPARANDO, "to": OrderStatus.ENVIADO, "reason": "Pedido en camino"},
                {"from": OrderStatus.ENVIADO, "to": OrderStatus.ENTREGADO, "reason": "Entregado al cliente"},
            ],
        },
    ]

    for idx, order_config in enumerate(old_orders, start=1):
        days_ago = order_config["days_ago"]
        status = order_config["status"]
        payment_status = order_config["payment_status"]
        product_indices = order_config["product_indices"]
        history_entries = order_config["history"]

        created_at = now - timedelta(days=days_ago)
        selected = [product_list[i] for i in product_indices]
        total = sum(p.price for p in selected)

        order = Order(
            user_id=user.id,
            address_id=address.id,
            status=status,
            total=total,
            currency="ARS",
            created_at=created_at,
        )
        session.add(order)
        await session.flush()

        for product in selected:
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
            status=payment_status,
            amount=total,
            currency="ARS",
        )
        session.add(payment)

        for entry in history_entries:
            h = OrderHistory(
                order_id=order.id,
                from_status=entry["from"],
                to_status=entry["to"],
                reason=entry.get("reason"),
                created_at=created_at + timedelta(days=1),
            )
            session.add(h)

        print(f"  [OK] Old Order #{idx}: status={status.value}, days_ago={days_ago}, items={len(selected)}, total=${total:.2f}")


async def main():
    """Run all seed functions in order."""
    print("=== Seeding database... ===")
    async with AsyncSessionLocal() as session:
        print("\n  -- Admin User --")
        await seed_admin(session)
        await session.commit()

        print("\n  -- Test Users --")
        test_user = await seed_users(session)
        await session.commit()

        print("\n  -- Kitchen and Pedidos Users --")
        await seed_cocina(session)
        await seed_pedidos(session)
        await session.commit()

        print("\n  -- Categories --")
        categories = await seed_categories(session)
        await session.commit()

        print("\n  -- Ingredients --")
        ingredients = await seed_ingredients(session)
        await session.commit()

        print("\n  -- Products --")
        products = await seed_products(session, categories)
        await session.commit()

        print("\n  -- Product-Ingredients --")
        await seed_product_ingredients(session, products, ingredients)
        await session.commit()

        print("\n  -- Addresses --")
        address = await seed_address(session, test_user)
        await session.commit()

        print("\n  -- Orders --")
        await seed_orders(session, test_user, address, products)
        await session.commit()

        print("\n  -- Old Orders (for date filter testing) --")
        await seed_old_orders(session, test_user, address, products)
        await session.commit()

    print("\n=== Seed completed successfully! ===")


if __name__ == "__main__":
    asyncio.run(main())
