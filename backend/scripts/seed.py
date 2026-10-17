#!/usr/bin/env python3
"""Seed the database with sample categories, products, and an admin user."""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from decimal import Decimal
from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models.user import User
from app.models.product import Category, Product
from app.core.security import get_password_hash
from app.core.config import settings

# Unsplash-style placeholder images (public)
SAMPLE_IMAGES = {
    "headphones": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
    "watch": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
    "sneakers": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
    "backpack": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop",
    "laptop": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop",
    "camera": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=600&fit=crop",
    "chair": "https://images.unsplash.com/photo-1503602642458-232111445657?w=600&h=600&fit=crop",
    "lamp": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=600&fit=crop",
    "coffee": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&h=600&fit=crop",
    "plant": "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=600&fit=crop",
    "keyboard": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=600&fit=crop",
    "mouse": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop",
    "speaker": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=600&fit=crop",
    "tablet": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop",
    "sunglasses": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop",
    "bottle": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop",
}

CATEGORIES = [
    {"name": "Electronics", "slug": "electronics", "description": "Gadgets, devices, and tech accessories"},
    {"name": "Fashion", "slug": "fashion", "description": "Clothing, shoes, and accessories"},
    {"name": "Home & Living", "slug": "home-living", "description": "Furniture, decor, and lifestyle products"},
    {"name": "Sports & Outdoors", "slug": "sports-outdoors", "description": "Gear for an active lifestyle"},
]

PRODUCTS = [
    {
        "name": "Premium Wireless Headphones",
        "slug": "premium-wireless-headphones",
        "description": "Experience immersive sound with active noise cancellation, 30-hour battery life, and premium comfort. Perfect for work, travel, and music lovers.",
        "price": Decimal("199.99"),
        "compare_at_price": Decimal("249.99"),
        "stock": 45,
        "sku": "EL-HP-001",
        "image_key": "headphones",
        "is_featured": True,
        "category": "electronics",
    },
    {
        "name": "Classic Minimalist Watch",
        "slug": "classic-minimalist-watch",
        "description": "Elegant timepiece with genuine leather strap, sapphire crystal, and Japanese quartz movement. A timeless addition to any wardrobe.",
        "price": Decimal("129.00"),
        "compare_at_price": Decimal("159.00"),
        "stock": 30,
        "sku": "FA-WT-002",
        "image_key": "watch",
        "is_featured": True,
        "category": "fashion",
    },
    {
        "name": "Urban Runner Sneakers",
        "slug": "urban-runner-sneakers",
        "description": "Lightweight, breathable running shoes with responsive cushioning. Designed for city streets and weekend trails.",
        "price": Decimal("89.99"),
        "compare_at_price": None,
        "stock": 60,
        "sku": "SP-SN-003",
        "image_key": "sneakers",
        "is_featured": True,
        "category": "sports-outdoors",
    },
    {
        "name": "Adventure Daypack",
        "slug": "adventure-daypack",
        "description": "Durable 25L backpack with laptop sleeve, water-resistant fabric, and ergonomic straps. Ideal for daily commute or day hikes.",
        "price": Decimal("74.50"),
        "compare_at_price": Decimal("99.00"),
        "stock": 40,
        "sku": "SP-BP-004",
        "image_key": "backpack",
        "is_featured": False,
        "category": "sports-outdoors",
    },
    {
        "name": "Pro Laptop 14\"",
        "slug": "pro-laptop-14",
        "description": "Powerful 14-inch laptop with high-resolution display, long battery life, and fast SSD storage. Built for professionals on the go.",
        "price": Decimal("1099.00"),
        "compare_at_price": Decimal("1299.00"),
        "stock": 15,
        "sku": "EL-LP-005",
        "image_key": "laptop",
        "is_featured": True,
        "category": "electronics",
    },
    {
        "name": "Mirrorless Camera Kit",
        "slug": "mirrorless-camera-kit",
        "description": "Compact mirrorless camera with 24MP sensor, 4K video, and kit lens. Capture stunning photos and videos anywhere.",
        "price": Decimal("799.00"),
        "compare_at_price": None,
        "stock": 12,
        "sku": "EL-CM-006",
        "image_key": "camera",
        "is_featured": True,
        "category": "electronics",
    },
    {
        "name": "Ergonomic Desk Chair",
        "slug": "ergonomic-desk-chair",
        "description": "Adjustable lumbar support, breathable mesh, and smooth-rolling casters. Sit comfortably through long work sessions.",
        "price": Decimal("249.00"),
        "compare_at_price": Decimal("299.00"),
        "stock": 22,
        "sku": "HL-CH-007",
        "image_key": "chair",
        "is_featured": False,
        "category": "home-living",
    },
    {
        "name": "Modern Desk Lamp",
        "slug": "modern-desk-lamp",
        "description": "LED desk lamp with adjustable brightness, color temperature, and USB charging port. Minimal design for any workspace.",
        "price": Decimal("49.99"),
        "compare_at_price": None,
        "stock": 55,
        "sku": "HL-LM-008",
        "image_key": "lamp",
        "is_featured": False,
        "category": "home-living",
    },
    {
        "name": "Artisan Coffee Maker",
        "slug": "artisan-coffee-maker",
        "description": "Pour-over style coffee maker with precision temperature control and elegant glass carafe. Brew café-quality coffee at home.",
        "price": Decimal("89.00"),
        "compare_at_price": Decimal("110.00"),
        "stock": 35,
        "sku": "HL-CF-009",
        "image_key": "coffee",
        "is_featured": True,
        "category": "home-living",
    },
    {
        "name": "Ceramic Plant Pot Set",
        "slug": "ceramic-plant-pot-set",
        "description": "Set of three handcrafted ceramic pots in complementary sizes. Drainage holes and matching saucers included.",
        "price": Decimal("39.99"),
        "compare_at_price": None,
        "stock": 48,
        "sku": "HL-PL-010",
        "image_key": "plant",
        "is_featured": False,
        "category": "home-living",
    },
    {
        "name": "Mechanical Keyboard",
        "slug": "mechanical-keyboard",
        "description": "Tactile mechanical switches, RGB backlighting, and full-size layout. Built for typing comfort and gaming performance.",
        "price": Decimal("119.99"),
        "compare_at_price": Decimal("149.99"),
        "stock": 28,
        "sku": "EL-KB-011",
        "image_key": "keyboard",
        "is_featured": False,
        "category": "electronics",
    },
    {
        "name": "Wireless Precision Mouse",
        "slug": "wireless-precision-mouse",
        "description": "Ergonomic wireless mouse with high-DPI sensor, silent clicks, and multi-device connectivity.",
        "price": Decimal("49.99"),
        "compare_at_price": None,
        "stock": 70,
        "sku": "EL-MS-012",
        "image_key": "mouse",
        "is_featured": False,
        "category": "electronics",
    },
    {
        "name": "Portable Bluetooth Speaker",
        "slug": "portable-bluetooth-speaker",
        "description": "Waterproof speaker with rich bass, 20-hour playtime, and built-in microphone for calls.",
        "price": Decimal("69.99"),
        "compare_at_price": Decimal("89.99"),
        "stock": 50,
        "sku": "EL-SP-013",
        "image_key": "speaker",
        "is_featured": True,
        "category": "electronics",
    },
    {
        "name": "10-inch Tablet",
        "slug": "10-inch-tablet",
        "description": "Sleek tablet with vibrant display, powerful processor, and all-day battery. Perfect for reading, streaming, and light work.",
        "price": Decimal("299.00"),
        "compare_at_price": Decimal("349.00"),
        "stock": 20,
        "sku": "EL-TB-014",
        "image_key": "tablet",
        "is_featured": False,
        "category": "electronics",
    },
    {
        "name": "Polarized Sunglasses",
        "slug": "polarized-sunglasses",
        "description": "UV400 protection, lightweight frames, and classic design. Stay stylish while protecting your eyes.",
        "price": Decimal("59.00"),
        "compare_at_price": None,
        "stock": 65,
        "sku": "FA-SG-015",
        "image_key": "sunglasses",
        "is_featured": False,
        "category": "fashion",
    },
    {
        "name": "Insulated Water Bottle",
        "slug": "insulated-water-bottle",
        "description": "32oz double-wall vacuum insulated bottle keeps drinks cold for 24 hours or hot for 12. Leak-proof and BPA-free.",
        "price": Decimal("34.99"),
        "compare_at_price": Decimal("44.99"),
        "stock": 80,
        "sku": "SP-BT-016",
        "image_key": "bottle",
        "is_featured": False,
        "category": "sports-outdoors",
    },
]

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Admin user
        admin = db.query(User).filter(User.email == settings.FIRST_ADMIN_EMAIL).first()
        if not admin:
            admin = User(
                email=settings.FIRST_ADMIN_EMAIL,
                hashed_password=get_password_hash(settings.FIRST_ADMIN_PASSWORD),
                full_name="ShopHub Admin",
                is_admin=True,
                is_active=True,
            )
            db.add(admin)
            print(f"Created admin: {settings.FIRST_ADMIN_EMAIL} / {settings.FIRST_ADMIN_PASSWORD}")
        else:
            print("Admin already exists")

        # Demo customer
        customer = db.query(User).filter(User.email == "customer@example.com").first()
        if not customer:
            customer = User(
                email="customer@example.com",
                hashed_password=get_password_hash("Customer123!"),
                full_name="Demo Customer",
                is_admin=False,
                is_active=True,
            )
            db.add(customer)
            print("Created demo customer: customer@example.com / Customer123!")

        # Categories
        cat_map = {}
        for c in CATEGORIES:
            existing = db.query(Category).filter(Category.slug == c["slug"]).first()
            if not existing:
                cat = Category(name=c["name"], slug=c["slug"], description=c["description"])
                db.add(cat)
                db.flush()
                cat_map[c["slug"]] = cat
                print(f"Created category: {c['name']}")
            else:
                cat_map[c["slug"]] = existing

        # Products
        for p in PRODUCTS:
            existing = db.query(Product).filter(Product.slug == p["slug"]).first()
            if not existing:
                cat = cat_map.get(p["category"])
                product = Product(
                    name=p["name"],
                    slug=p["slug"],
                    description=p["description"],
                    price=p["price"],
                    compare_at_price=p["compare_at_price"],
                    stock=p["stock"],
                    sku=p["sku"],
                    image_url=SAMPLE_IMAGES.get(p["image_key"]),
                    is_featured=p["is_featured"],
                    is_active=True,
                    category_id=cat.id if cat else None,
                )
                db.add(product)
                print(f"Created product: {p['name']}")
            else:
                print(f"Product exists: {p['name']}")

        db.commit()
        print("\nSeed completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Seed failed: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed()
