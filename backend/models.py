from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from sqlalchemy.sql import func
from database import Base
from pydantic import BaseModel
from typing import Optional


# =============================
# PYDANTIC REQUEST MODELS
# =============================

class LoginRequest(BaseModel):
    username: str
    password: str

class ChatRequest(BaseModel):
    message: str

class TicketCreateRequest(BaseModel):
    order_id: str
    request_type: str  # cancel / return / refund
    reason: str

class TicketActionRequest(BaseModel):
    admin_remarks: str

class TicketMessageRequest(BaseModel):
    sender_role: str  # user / admin
    message: str

class ReviewCreateRequest(BaseModel):
    order_id: str
    rating: int  # 1-5
    review: str


# =============================
# DATABASE MODELS
# =============================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True)
    password = Column(String)
    role = Column(String)


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String, unique=True, index=True)
    user_id = Column(Integer, index=True)
    product_name = Column(String, default="Unknown")
    category = Column(String, default="General")
    status = Column(String, default="Pending")
    city = Column(String)
    eta = Column(String)
    refund = Column(Integer, default=0)
    payment_status = Column(String, default="Paid")
    price = Column(Float, default=0.0)
    created_at = Column(String, default="2026-01-01")


class OrderTimeline(Base):
    __tablename__ = "order_timeline"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String, index=True)
    stage = Column(String)  # Ordered, Packed, Shipped, Out for Delivery, Delivered
    timestamp = Column(String)
    completed = Column(Boolean, default=False)


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(String, unique=True, index=True)
    order_id = Column(String, index=True)
    user_id = Column(Integer, index=True)
    request_type = Column(String)  # cancel / return / refund
    reason = Column(String)
    status = Column(String, default="pending")  # pending / approved / rejected
    admin_remarks = Column(String, default="")
    created_at = Column(String)


class TicketMessage(Base):
    __tablename__ = "ticket_messages"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(String, index=True)
    sender_role = Column(String)  # user / admin
    sender_name = Column(String, default="")
    message = Column(Text)
    timestamp = Column(String)


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String, index=True)
    user_id = Column(Integer, index=True)
    rating = Column(Integer)  # 1-5
    review = Column(Text, default="")
    created_at = Column(String)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String)
    details = Column(Text, default="")
    performed_by = Column(String)  # username
    role = Column(String)  # admin / system
    timestamp = Column(String)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    message = Column(String)
    notification_type = Column(String)  # ticket / delivery / refund
    is_read = Column(Boolean, default=False)
    created_at = Column(String)