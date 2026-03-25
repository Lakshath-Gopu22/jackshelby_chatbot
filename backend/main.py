from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from datetime import datetime
import json

from database import engine, Base, SessionLocal
from models import (
    User, Order, OrderTimeline, Ticket, TicketMessage,
    Review, AuditLog, Notification,
    LoginRequest, ChatRequest, TicketCreateRequest,
    TicketActionRequest, TicketMessageRequest, ReviewCreateRequest
)
from seed import seed
from ai_engine import jackshelby_ai, ai_analyze_insights

app = FastAPI(title="JackShelby AI Logistics API")

# Create tables
Base.metadata.create_all(bind=engine)

# Seed database only once
seed()

# ===============================
# CORS CONFIG
# ===============================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===============================
# DATABASE DEPENDENCY
# ===============================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def now():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def log_audit(db, action, details, performed_by, role="admin"):
    db.add(AuditLog(action=action, details=details,
                    performed_by=performed_by, role=role, timestamp=now()))
    db.commit()

def create_notification(db, user_id, message, ntype):
    db.add(Notification(user_id=user_id, message=message,
                        notification_type=ntype, created_at=now()))
    db.commit()


# ===============================
# HEALTH CHECK
# ===============================
@app.get("/")
def root():
    return {"message": "JackShelby AI Logistics API v2.0 - Enterprise Edition"}


# ===============================
# AUTH
# ===============================
@app.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.username == req.username,
        User.password == req.password
    ).first()

    if user:
        return {
            "user_id": user.id,
            "role": user.role,
            "username": user.username
        }
    return {"error": "Invalid credentials"}


# ===============================
# CUSTOMER ORDERS
# ===============================
@app.get("/orders/{user_id}")
def get_orders(user_id: int, db: Session = Depends(get_db)):
    return db.query(Order).filter(Order.user_id == user_id).all()


# ===============================
# ORDER DETAIL (with timeline + tickets)
# ===============================
@app.get("/orders/detail/{order_id}")
def get_order_detail(order_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    user = db.query(User).filter(User.id == order.user_id).first()
    timeline = db.query(OrderTimeline).filter(
        OrderTimeline.order_id == order_id
    ).order_by(OrderTimeline.id).all()
    tickets = db.query(Ticket).filter(Ticket.order_id == order_id).all()
    review = db.query(Review).filter(Review.order_id == order_id).first()

    return {
        "order": {
            "id": order.id,
            "order_id": order.order_id,
            "product_name": order.product_name,
            "category": order.category,
            "status": order.status,
            "city": order.city,
            "eta": order.eta,
            "refund": order.refund,
            "payment_status": order.payment_status,
            "price": order.price,
            "created_at": order.created_at,
        },
        "user": {
            "id": user.id if user else None,
            "username": user.username if user else "Unknown",
        },
        "timeline": [
            {"stage": t.stage, "timestamp": t.timestamp, "completed": t.completed}
            for t in timeline
        ],
        "tickets": [
            {
                "ticket_id": t.ticket_id,
                "request_type": t.request_type,
                "reason": t.reason,
                "status": t.status,
                "created_at": t.created_at,
            }
            for t in tickets
        ],
        "review": {
            "rating": review.rating,
            "review": review.review,
            "created_at": review.created_at,
        } if review else None
    }


# ===============================
# CANCEL ORDER
# ===============================
@app.post("/orders/{order_id}/cancel")
def cancel_order(order_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.order_id == order_id).first()

    if not order:
        return {"error": "Order not found", "success": False}

    if order.status not in ["Pending", "In Transit"]:
        return {"error": "Order cannot be cancelled at this stage.", "success": False}

    order.status = "Cancelled"
    order.refund = max(int(order.price * 0.9), 500)  # 90% refund or min ₹500
    order.payment_status = "Refunded"
    db.commit()

    create_notification(db, order.user_id,
                        f"Order {order_id} cancelled. Refund: ₹{order.refund}", "refund")
    log_audit(db, "Order Cancelled", f"Order {order_id} cancelled. Refund: ₹{order.refund}",
              "system", "system")

    return {"message": "Order successfully cancelled.", "success": True, "refund": order.refund}


# ===============================
# TICKETS
# ===============================
@app.get("/tickets")
def get_all_tickets(db: Session = Depends(get_db)):
    tickets = db.query(Ticket, User.username).join(
        User, Ticket.user_id == User.id
    ).order_by(Ticket.id.desc()).all()

    return [{
        "id": t.id,
        "ticket_id": t.ticket_id,
        "order_id": t.order_id,
        "user_id": t.user_id,
        "username": username,
        "request_type": t.request_type,
        "reason": t.reason,
        "status": t.status,
        "admin_remarks": t.admin_remarks,
        "created_at": t.created_at,
    } for t, username in tickets]


@app.get("/tickets/user/{user_id}")
def get_user_tickets(user_id: int, db: Session = Depends(get_db)):
    tickets = db.query(Ticket).filter(Ticket.user_id == user_id).order_by(Ticket.id.desc()).all()
    return [{
        "id": t.id,
        "ticket_id": t.ticket_id,
        "order_id": t.order_id,
        "request_type": t.request_type,
        "reason": t.reason,
        "status": t.status,
        "admin_remarks": t.admin_remarks,
        "created_at": t.created_at,
    } for t in tickets]


@app.get("/tickets/{ticket_id}")
def get_ticket_detail(ticket_id: str, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    user = db.query(User).filter(User.id == ticket.user_id).first()
    order = db.query(Order).filter(Order.order_id == ticket.order_id).first()
    messages = db.query(TicketMessage).filter(
        TicketMessage.ticket_id == ticket_id
    ).order_by(TicketMessage.id).all()
    timeline = db.query(OrderTimeline).filter(
        OrderTimeline.order_id == ticket.order_id
    ).order_by(OrderTimeline.id).all()

    return {
        "ticket": {
            "id": ticket.id,
            "ticket_id": ticket.ticket_id,
            "order_id": ticket.order_id,
            "request_type": ticket.request_type,
            "reason": ticket.reason,
            "status": ticket.status,
            "admin_remarks": ticket.admin_remarks,
            "created_at": ticket.created_at,
        },
        "user": {
            "id": user.id if user else None,
            "username": user.username if user else "Unknown",
        },
        "order": {
            "order_id": order.order_id if order else "",
            "product_name": order.product_name if order else "",
            "status": order.status if order else "",
            "city": order.city if order else "",
            "eta": order.eta if order else "",
            "price": order.price if order else 0,
            "payment_status": order.payment_status if order else "",
        } if order else None,
        "timeline": [
            {"stage": t.stage, "timestamp": t.timestamp, "completed": t.completed}
            for t in timeline
        ],
        "messages": [
            {
                "sender_role": m.sender_role,
                "sender_name": m.sender_name,
                "message": m.message,
                "timestamp": m.timestamp,
            }
            for m in messages
        ]
    }


@app.post("/tickets/create")
def create_ticket(req: TicketCreateRequest, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.order_id == req.order_id).first()
    if not order:
        return {"error": "Order not found", "success": False}

    # Generate ticket ID
    count = db.query(Ticket).count()
    ticket_id = f"TKT-{count + 1:03d}"

    ticket = Ticket(
        ticket_id=ticket_id,
        order_id=req.order_id,
        user_id=order.user_id,
        request_type=req.request_type,
        reason=req.reason,
        status="pending",
        created_at=now()
    )
    db.add(ticket)
    db.commit()

    # Add initial message
    user = db.query(User).filter(User.id == order.user_id).first()
    db.add(TicketMessage(
        ticket_id=ticket_id,
        sender_role="user",
        sender_name=user.username if user else "user",
        message=req.reason,
        timestamp=now()
    ))
    db.commit()

    create_notification(db, order.user_id,
                        f"Ticket {ticket_id} created for order {req.order_id}", "ticket")
    log_audit(db, "Ticket Created",
              f"{ticket_id}: {req.request_type} for {req.order_id}",
              user.username if user else "user", "customer")

    return {"success": True, "ticket_id": ticket_id}


@app.post("/tickets/{ticket_id}/approve")
def approve_ticket(ticket_id: str, req: TicketActionRequest, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket.status = "approved"
    ticket.admin_remarks = req.admin_remarks

    # Apply action to order
    order = db.query(Order).filter(Order.order_id == ticket.order_id).first()
    if order and ticket.request_type == "cancel":
        order.status = "Cancelled"
        order.refund = max(int(order.price * 0.9), 500)
        order.payment_status = "Refunded"
    elif order and ticket.request_type == "return":
        order.status = "Returned"
        order.refund = int(order.price)
        order.payment_status = "Refunded"
    elif order and ticket.request_type == "refund":
        order.refund = int(order.price)
        order.payment_status = "Refunded"

    db.commit()

    # Admin message
    db.add(TicketMessage(
        ticket_id=ticket_id, sender_role="admin", sender_name="admin",
        message=f"Ticket approved. {req.admin_remarks}", timestamp=now()
    ))
    db.commit()

    create_notification(db, ticket.user_id,
                        f"Your ticket {ticket_id} has been approved!", "ticket")
    log_audit(db, "Ticket Approved",
              f"{ticket_id} approved. Remarks: {req.admin_remarks}", "admin")

    return {"success": True, "message": "Ticket approved"}


@app.post("/tickets/{ticket_id}/reject")
def reject_ticket(ticket_id: str, req: TicketActionRequest, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket.status = "rejected"
    ticket.admin_remarks = req.admin_remarks
    db.commit()

    db.add(TicketMessage(
        ticket_id=ticket_id, sender_role="admin", sender_name="admin",
        message=f"Ticket rejected. {req.admin_remarks}", timestamp=now()
    ))
    db.commit()

    create_notification(db, ticket.user_id,
                        f"Your ticket {ticket_id} was rejected. Reason: {req.admin_remarks}", "ticket")
    log_audit(db, "Ticket Rejected",
              f"{ticket_id} rejected. Remarks: {req.admin_remarks}", "admin")

    return {"success": True, "message": "Ticket rejected"}


@app.post("/tickets/{ticket_id}/message")
def add_ticket_message(ticket_id: str, req: TicketMessageRequest, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    db.add(TicketMessage(
        ticket_id=ticket_id,
        sender_role=req.sender_role,
        sender_name=req.sender_role,
        message=req.message,
        timestamp=now()
    ))
    db.commit()

    return {"success": True}


# ===============================
# REVIEWS
# ===============================
@app.post("/reviews")
def create_review(req: ReviewCreateRequest, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.order_id == req.order_id).first()
    if not order:
        return {"error": "Order not found", "success": False}

    existing = db.query(Review).filter(Review.order_id == req.order_id).first()
    if existing:
        return {"error": "Review already submitted for this order", "success": False}

    db.add(Review(
        order_id=req.order_id,
        user_id=order.user_id,
        rating=max(1, min(5, req.rating)),
        review=req.review,
        created_at=now()
    ))
    db.commit()

    return {"success": True, "message": "Review submitted!"}


@app.get("/reviews")
def get_all_reviews(db: Session = Depends(get_db)):
    reviews = db.query(Review, User.username, Order.product_name, Order.order_id).join(
        User, Review.user_id == User.id
    ).join(
        Order, Review.order_id == Order.order_id
    ).order_by(Review.id.desc()).all()

    return [{
        "id": r.id,
        "order_id": order_id,
        "username": username,
        "product_name": product_name,
        "rating": r.rating,
        "review": r.review,
        "created_at": r.created_at,
    } for r, username, product_name, order_id in reviews]


@app.get("/reviews/user/{user_id}")
def get_user_reviews(user_id: int, db: Session = Depends(get_db)):
    return db.query(Review).filter(Review.user_id == user_id).all()


# ===============================
# NOTIFICATIONS
# ===============================
@app.get("/notifications/{user_id}")
def get_notifications(user_id: int, db: Session = Depends(get_db)):
    notifs = db.query(Notification).filter(
        Notification.user_id == user_id
    ).order_by(Notification.id.desc()).limit(20).all()

    return [{
        "id": n.id,
        "message": n.message,
        "type": n.notification_type,
        "is_read": n.is_read,
        "created_at": n.created_at,
    } for n in notifs]


@app.post("/notifications/{user_id}/read-all")
def mark_all_read(user_id: int, db: Session = Depends(get_db)):
    db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"success": True}


# ===============================
# ADMIN INSIGHTS
# ===============================
@app.get("/admin/insights")
def admin_insights(db: Session = Depends(get_db)):
    total = db.query(Order).count()
    delivered = db.query(Order).filter(Order.status == "Delivered").count()
    in_transit = db.query(Order).filter(Order.status == "In Transit").count()
    delayed = db.query(Order).filter(Order.status == "Delayed").count()
    returned = db.query(Order).filter(Order.status == "Returned").count()
    pending = db.query(Order).filter(Order.status == "Pending").count()
    cancelled = db.query(Order).filter(Order.status == "Cancelled").count()
    refunded = db.query(Order).filter(Order.refund > 0).count()
    total_refund_amount = db.query(func.sum(Order.refund)).scalar() or 0

    return {
        "total_orders": total,
        "delivered": delivered,
        "in_transit": in_transit,
        "delayed": delayed,
        "returned": returned,
        "pending": pending,
        "cancelled": cancelled,
        "refunded": refunded,
        "total_refund_amount": total_refund_amount,
    }


# ===============================
# ADMIN ALL ORDERS
# ===============================
@app.get("/admin/all_orders")
def all_orders(db: Session = Depends(get_db)):
    orders = db.query(Order, User.username).join(
        User, Order.user_id == User.id
    ).all()

    return [{
        "id": o.id,
        "order_id": o.order_id,
        "product_name": o.product_name,
        "category": o.category,
        "status": o.status,
        "city": o.city,
        "eta": o.eta,
        "refund": o.refund,
        "price": o.price,
        "payment_status": o.payment_status,
        "username": username,
        "created_at": o.created_at,
    } for o, username in orders]


# ===============================
# ADMIN CUSTOMERS
# ===============================
@app.get("/admin/customers")
def admin_customers(db: Session = Depends(get_db)):
    users = db.query(User).filter(User.role == "customer").all()
    result = []

    for u in users:
        orders_count = db.query(Order).filter(Order.user_id == u.id).count()
        total_refunded = db.query(func.sum(Order.refund)).filter(
            Order.user_id == u.id).scalar() or 0
        avg_rating = db.query(func.avg(Review.rating)).filter(
            Review.user_id == u.id).scalar()

        result.append({
            "id": u.id,
            "username": u.username,
            "orders_count": orders_count,
            "total_refunded": total_refunded,
            "avg_rating": round(avg_rating, 1) if avg_rating else None,
        })

    return result


# ===============================
# ADMIN ANALYTICS (ADVANCED)
# ===============================
@app.get("/admin/analytics")
def admin_analytics(db: Session = Depends(get_db)):
    # City-wise order distribution
    city_data = db.query(Order.city, func.count(Order.id)).group_by(Order.city).all()
    city_orders = {city: count for city, count in city_data}

    # Status distribution
    status_data = db.query(Order.status, func.count(Order.id)).group_by(Order.status).all()
    status_dist = {status: count for status, count in status_data}

    # City-wise delays
    delay_data = db.query(Order.city, func.count(Order.id)).filter(
        Order.status == "Delayed"
    ).group_by(Order.city).all()
    city_delays = {city: count for city, count in delay_data}

    # Product-wise returns
    return_data = db.query(Order.product_name, func.count(Order.id)).filter(
        Order.status == "Returned"
    ).group_by(Order.product_name).all()
    product_returns = {product: count for product, count in return_data}

    # Average rating
    avg_rating = db.query(func.avg(Review.rating)).scalar()

    # Total revenue & refunds
    total_revenue = db.query(func.sum(Order.price)).scalar() or 0
    total_refunds = db.query(func.sum(Order.refund)).scalar() or 0

    # Ticket stats
    total_tickets = db.query(Ticket).count()
    pending_tickets = db.query(Ticket).filter(Ticket.status == "pending").count()
    approved_tickets = db.query(Ticket).filter(Ticket.status == "approved").count()
    rejected_tickets = db.query(Ticket).filter(Ticket.status == "rejected").count()

    return {
        "city_orders": city_orders,
        "status_distribution": status_dist,
        "city_delays": city_delays,
        "product_returns": product_returns,
        "avg_rating": round(avg_rating, 1) if avg_rating else 0,
        "total_revenue": total_revenue,
        "total_refunds": total_refunds,
        "ticket_stats": {
            "total": total_tickets,
            "pending": pending_tickets,
            "approved": approved_tickets,
            "rejected": rejected_tickets,
        }
    }


# ===============================
# AUDIT LOGS
# ===============================
@app.get("/admin/audit-logs")
def get_audit_logs(db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.id.desc()).limit(50).all()
    return [{
        "id": l.id,
        "action": l.action,
        "details": l.details,
        "performed_by": l.performed_by,
        "role": l.role,
        "timestamp": l.timestamp,
    } for l in logs]


# ===============================
# AI CHATBOT (ENHANCED)
# ===============================
@app.post("/chat/{user_id}")
def chat(user_id: int, req: ChatRequest, db: Session = Depends(get_db)):
    orders = db.query(Order).filter(Order.user_id == user_id).all()
    tickets = db.query(Ticket).filter(Ticket.user_id == user_id).all()

    context = "Customer Orders:\n"
    for o in orders:
        context += (f"  {o.order_id} | {o.product_name} | {o.status} | "
                    f"{o.city} | ETA: {o.eta} | Price: ₹{o.price} | "
                    f"Refund: ₹{o.refund} | Payment: {o.payment_status}\n")

    if tickets:
        context += "\nCustomer Tickets:\n"
        for t in tickets:
            context += (f"  {t.ticket_id} | Order: {t.order_id} | "
                        f"Type: {t.request_type} | Status: {t.status}\n")

    reply = jackshelby_ai(f"{context}\nCustomer Question: {req.message}")

    return {"reply": reply}


# ===============================
# AI INSIGHTS
# ===============================
@app.get("/admin/ai-insights")
def get_ai_insights(db: Session = Depends(get_db)):
    orders = db.query(Order).all()
    data_summary = ""
    for o in orders:
        data_summary += f"{o.order_id}: {o.product_name} | {o.status} | {o.city} | Refund: ₹{o.refund}\n"

    insights = ai_analyze_insights(data_summary)
    return {"insights": insights}