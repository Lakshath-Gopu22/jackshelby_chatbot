from database import SessionLocal
from models import User, Order

def seed():
    db = SessionLocal()
    if db.query(User).first():
        db.close()
        return

    users = [
        User(username="luffy", password="onepiece", role="customer"),
        User(username="eren", password="aot", role="customer"),
        User(username="admin", password="admin123", role="admin")
    ]

    db.add_all(users)
    db.commit()

    orders = [
        # Luffy's Orders (user 1)
        Order(order_id="TN1001", user_id=1, status="Delivered", city="Chennai", eta="2026-02-15", refund=0),
        Order(order_id="TN1002", user_id=1, status="Returned", city="Coimbatore", eta="2026-02-22", refund=1200),
        Order(order_id="TN1003", user_id=1, status="Delayed", city="Madurai", eta="2026-03-08", refund=150),
        Order(order_id="TN1004", user_id=1, status="In Transit", city="Trichy", eta="2026-03-06", refund=0),
        Order(order_id="TN1005", user_id=1, status="Pending", city="Salem", eta="2026-03-10", refund=0),
        Order(order_id="TN1006", user_id=1, status="Delivered", city="Tirunelveli", eta="2026-01-20", refund=0),
        Order(order_id="TN1007", user_id=1, status="In Transit", city="Erode", eta="2026-03-05", refund=0),
        Order(order_id="TN1008", user_id=1, status="Cancelled", city="Vellore", eta="N/A", refund=400),
        
        # Eren's Orders (user 2)
        Order(order_id="TN2001", user_id=2, status="Returned", city="Salem", eta="2026-02-25", refund=800),
        Order(order_id="TN2002", user_id=2, status="In Transit", city="Trichy", eta="2026-03-06", refund=0),
        Order(order_id="TN2003", user_id=2, status="Delivered", city="Chennai", eta="2026-02-10", refund=0),
        Order(order_id="TN2004", user_id=2, status="Delayed", city="Coimbatore", eta="2026-03-09", refund=200),
        Order(order_id="TN2005", user_id=2, status="Pending", city="Madurai", eta="2026-03-12", refund=0),
        Order(order_id="TN2006", user_id=2, status="In Transit", city="Thoothukudi", eta="2026-03-07", refund=0),
        Order(order_id="TN2007", user_id=2, status="Cancelled", city="Karur", eta="N/A", refund=1500),
        Order(order_id="TN2008", user_id=2, status="Delivered", city="Nagercoil", eta="2026-01-15", refund=0),
        
        # Admin mock orders (user 3, sometimes admins make test orders or have internal tracking)
        Order(order_id="SYS001", user_id=3, status="Delivered", city="Chennai HQ", eta="2026-01-01", refund=0),
        Order(order_id="SYS002", user_id=3, status="In Transit", city="Bangalore", eta="2026-03-05", refund=0),
        Order(order_id="SYS003", user_id=3, status="Pending", city="Hyderabad", eta="2026-03-15", refund=0),
        Order(order_id="SYS004", user_id=3, status="Delayed", city="Pune", eta="2026-03-12", refund=50),
        Order(order_id="SYS005", user_id=3, status="Returned", city="Delhi", eta="2026-02-28", refund=5000),
    ]

    db.add_all(orders)
    db.commit()
    db.close()