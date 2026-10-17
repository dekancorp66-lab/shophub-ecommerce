from decimal import Decimal
from math import ceil
import secrets
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
from app.db.session import get_db
from app.models.order import Order, OrderItem, OrderStatus
from app.models.cart import CartItem
from app.models.product import Product
from app.models.user import User
from app.schemas.order import CheckoutRequest, OrderOut, OrderListResponse, OrderStatusUpdate
from app.api.deps import get_current_user, get_current_admin_user

router = APIRouter(prefix="/orders", tags=["orders"])

def generate_order_number() -> str:
    ts = datetime.now(timezone.utc).strftime("%Y%m%d")
    rand = secrets.token_hex(3).upper()
    return f"SH-{ts}-{rand}"

@router.post("/checkout", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def checkout(
    data: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Place an order from the user's cart.
    This is a demonstration / Cash-on-Delivery workflow.
    No real payment is processed.
    """
    cart_items = (
        db.query(CartItem)
        .filter(CartItem.user_id == current_user.id)
        .options(joinedload(CartItem.product))
        .all()
    )
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Validate stock and compute totals under transaction
    try:
        subtotal = Decimal("0.00")
        order_items_data = []
        
        for ci in cart_items:
            product = ci.product
            if not product or not product.is_active:
                raise HTTPException(status_code=400, detail=f"Product '{product.name if product else 'unknown'}' is no longer available")
            if product.stock < ci.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for '{product.name}'. Only {product.stock} available."
                )
            unit_price = Decimal(str(product.price))
            line_total = unit_price * ci.quantity
            subtotal += line_total
            order_items_data.append({
                "product": product,
                "quantity": ci.quantity,
                "unit_price": unit_price,
                "line_total": line_total,
            })
        
        shipping_cost = Decimal("0.00")  # Free shipping demo
        tax = (subtotal * Decimal("0.08")).quantize(Decimal("0.01"))  # 8% demo tax
        total = subtotal + shipping_cost + tax
        
        order = Order(
            order_number=generate_order_number(),
            user_id=current_user.id,
            status=OrderStatus.PENDING.value,
            contact_email=data.contact_email,
            contact_phone=data.contact_phone,
            shipping_full_name=data.shipping_full_name,
            shipping_address_line1=data.shipping_address_line1,
            shipping_address_line2=data.shipping_address_line2,
            shipping_city=data.shipping_city,
            shipping_state=data.shipping_state,
            shipping_postal_code=data.shipping_postal_code,
            shipping_country=data.shipping_country,
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            tax=tax,
            total=total,
            notes=data.notes,
            payment_method="cash_on_delivery",
        )
        db.add(order)
        db.flush()  # get order.id
        
        for oid in order_items_data:
            product = oid["product"]
            oi = OrderItem(
                order_id=order.id,
                product_id=product.id,
                product_name=product.name,
                product_sku=product.sku,
                unit_price=oid["unit_price"],
                quantity=oid["quantity"],
                line_total=oid["line_total"],
            )
            db.add(oi)
            # Decrement stock
            product.stock -= oid["quantity"]
        
        # Clear cart
        db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
        
        db.commit()
        db.refresh(order)
        
        # Reload with items
        order = (
            db.query(Order)
            .options(joinedload(Order.items))
            .filter(Order.id == order.id)
            .first()
        )
        return order
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Order failed: {str(e)}")

@router.get("", response_model=OrderListResponse)
def list_my_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Order).filter(Order.user_id == current_user.id)
    total = q.count()
    orders = (
        q.options(joinedload(Order.items))
        .order_by(Order.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return OrderListResponse(
        items=orders,
        total=total,
        page=page,
        page_size=page_size,
        pages=ceil(total / page_size) if page_size else 0,
    )

@router.get("/{order_id}", response_model=OrderOut)
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.id == order_id, Order.user_id == current_user.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
