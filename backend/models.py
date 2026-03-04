from sqlalchemy import Column, Integer, String
from database import Base
from pydantic import BaseModel

class LoginRequest(BaseModel):
    username: str
    password: str


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True)
    password = Column(String)
    role = Column(String)


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String)
    user_id = Column(Integer)
    status = Column(String)
    city = Column(String)
    eta = Column(String)
    refund = Column(Integer)