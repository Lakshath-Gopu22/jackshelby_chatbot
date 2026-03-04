from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from models import User, Order, LoginRequest
from seed import seed
from ai_engine import jackshelby_ai

app = FastAPI()

Base.metadata.create_all(bind=engine)
seed()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username, User.password == req.password).first()
    if user:
        return {"user_id": user.id, "role": user.role, "username": user.username}
    return {"error": "Invalid credentials"}


@app.get("/orders/{user_id}")
def get_orders(user_id: int, db: Session = Depends(get_db)):
    return db.query(Order).filter(Order.user_id == user_id).all()

@app.post("/orders/{order_id}/cancel")
def cancel_order(order_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.order_id == order_id).first()
    if not order:
        return {"error": "Order not found", "success": False}
    
    if order.status not in ["Pending", "In Transit"]:
        return {"error": "Order cannot be cancelled at this stage.", "success": False}
    
    order.status = "Cancelled"
    order.refund = 500 # simple mock refund logic
    db.commit()
    return {"message": "Order successfully cancelled.", "success": True, "refund": order.refund}


@app.get("/admin/insights")
def admin_insights(db: Session = Depends(get_db)):
    total = db.query(Order).count()
    delivered = db.query(Order).filter(Order.status == "Delivered").count()
    in_transit = db.query(Order).filter(Order.status == "In Transit").count()
    delayed = db.query(Order).filter(Order.status == "Delayed").count()
    returned = db.query(Order).filter(Order.status == "Returned").count()
    refunded = db.query(Order).filter(Order.refund > 0).count()

    return {
        "total_orders": total,
        "delivered": delivered,
        "in_transit": in_transit,
        "delayed": delayed,
        "returned": returned,
        "refunded": refunded
    }

@app.get("/admin/all_orders")
def all_orders(db: Session = Depends(get_db)):
    orders = db.query(Order, User.username).join(User, Order.user_id == User.id).all()
    result = []
    for o, username in orders:
        result.append({
            "id": o.id,
            "order_id": o.order_id,
            "status": o.status,
            "city": o.city,
            "eta": o.eta,
            "refund": o.refund,
            "username": username
        })
    return result

from sqlalchemy import func

@app.get("/admin/customers")
def admin_customers(db: Session = Depends(get_db)):
    users = db.query(User).filter(User.role == "customer").all()
    result = []
    for u in users:
        orders_count = db.query(Order).filter(Order.user_id == u.id).count()
        total_refunded = db.query(func.sum(Order.refund)).filter(Order.user_id == u.id).scalar() or 0
        result.append({
            "id": u.id,
            "username": u.username,
            "orders_count": orders_count,
            "total_refunded": total_refunded
        })
    return result


@app.post("/chat/{user_id}")
def chat(user_id: int, message: str, db: Session = Depends(get_db)):
    orders = db.query(Order).filter(Order.user_id == user_id).all()

    context = ""
    for o in orders:
        context += f"{o.order_id} - {o.status} - {o.city} - ETA {o.eta}\n"

    reply = jackshelby_ai(f"Customer Orders:\n{context}\n\nQuestion:{message}")
    return {"reply": reply}