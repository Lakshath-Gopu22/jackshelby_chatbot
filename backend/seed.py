from database import SessionLocal
from models import User, Order, OrderTimeline, Ticket, TicketMessage, Review, AuditLog, Notification
from datetime import datetime

def now():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def seed():
    db = SessionLocal()
    if db.query(User).first():
        db.close()
        return

    # =============================
    # USERS
    # =============================
    users = [
        User(username="luffy", password="onepiece", role="customer"),
        User(username="eren", password="aot", role="customer"),
        User(username="naruto", password="hokage", role="customer"),
        User(username="goku", password="saiyan", role="customer"),
        User(username="admin", password="admin123", role="admin"),
    ]
    db.add_all(users)
    db.commit()

    # =============================
    # ORDERS (4 users × 5 orders)
    # =============================
    orders = [
        # Luffy (user_id=1)
        Order(order_id="TN1001", user_id=1, product_name="Mobile", category="Electronics",
              status="Delivered", city="Chennai", eta="2026-02-15", refund=0,
              payment_status="Paid", price=15999, created_at="2026-02-01"),
        Order(order_id="TN1002", user_id=1, product_name="Laptop", category="Electronics",
              status="Returned", city="Coimbatore", eta="2026-02-22", refund=1200,
              payment_status="Refunded", price=54999, created_at="2026-02-10"),
        Order(order_id="TN1003", user_id=1, product_name="Shoes", category="Fashion",
              status="Delayed", city="Madurai", eta="2026-03-08", refund=0,
              payment_status="Paid", price=2999, created_at="2026-02-25"),
        Order(order_id="TN1004", user_id=1, product_name="Headphones", category="Electronics",
              status="In Transit", city="Trichy", eta="2026-03-06", refund=0,
              payment_status="Paid", price=3499, created_at="2026-03-01"),
        Order(order_id="TN1005", user_id=1, product_name="T-shirt", category="Fashion",
              status="Pending", city="Salem", eta="2026-03-10", refund=0,
              payment_status="Paid", price=799, created_at="2026-03-05"),

        # Eren (user_id=2)
        Order(order_id="TN2001", user_id=2, product_name="Laptop", category="Electronics",
              status="Returned", city="Salem", eta="2026-02-25", refund=800,
              payment_status="Refunded", price=49999, created_at="2026-02-05"),
        Order(order_id="TN2002", user_id=2, product_name="Mobile", category="Electronics",
              status="In Transit", city="Trichy", eta="2026-03-06", refund=0,
              payment_status="Paid", price=21999, created_at="2026-02-28"),
        Order(order_id="TN2003", user_id=2, product_name="Shoes", category="Fashion",
              status="Delivered", city="Chennai", eta="2026-02-10", refund=0,
              payment_status="Paid", price=4599, created_at="2026-01-25"),
        Order(order_id="TN2004", user_id=2, product_name="T-shirt", category="Fashion",
              status="Delayed", city="Coimbatore", eta="2026-03-09", refund=200,
              payment_status="Paid", price=1299, created_at="2026-02-20"),
        Order(order_id="TN2005", user_id=2, product_name="Headphones", category="Electronics",
              status="Pending", city="Madurai", eta="2026-03-12", refund=0,
              payment_status="Paid", price=5999, created_at="2026-03-02"),

        # Naruto (user_id=3)
        Order(order_id="TN3001", user_id=3, product_name="Mobile", category="Electronics",
              status="Delivered", city="Madurai", eta="2026-02-18", refund=0,
              payment_status="Paid", price=18999, created_at="2026-02-01"),
        Order(order_id="TN3002", user_id=3, product_name="Headphones", category="Electronics",
              status="In Transit", city="Salem", eta="2026-03-07", refund=0,
              payment_status="Paid", price=2499, created_at="2026-02-22"),
        Order(order_id="TN3003", user_id=3, product_name="T-shirt", category="Fashion",
              status="Delayed", city="Trichy", eta="2026-03-11", refund=0,
              payment_status="Paid", price=999, created_at="2026-02-28"),
        Order(order_id="TN3004", user_id=3, product_name="Laptop", category="Electronics",
              status="Returned", city="Chennai", eta="2026-02-20", refund=3500,
              payment_status="Refunded", price=62999, created_at="2026-02-08"),
        Order(order_id="TN3005", user_id=3, product_name="Shoes", category="Fashion",
              status="Pending", city="Coimbatore", eta="2026-03-15", refund=0,
              payment_status="Paid", price=3299, created_at="2026-03-04"),

        # Goku (user_id=4)
        Order(order_id="TN4001", user_id=4, product_name="Laptop", category="Electronics",
              status="Delivered", city="Trichy", eta="2026-02-12", refund=0,
              payment_status="Paid", price=45999, created_at="2026-01-28"),
        Order(order_id="TN4002", user_id=4, product_name="T-shirt", category="Fashion",
              status="Delivered", city="Madurai", eta="2026-02-20", refund=0,
              payment_status="Paid", price=1499, created_at="2026-02-10"),
        Order(order_id="TN4003", user_id=4, product_name="Mobile", category="Electronics",
              status="Delayed", city="Salem", eta="2026-03-10", refund=0,
              payment_status="Paid", price=29999, created_at="2026-02-25"),
        Order(order_id="TN4004", user_id=4, product_name="Shoes", category="Fashion",
              status="In Transit", city="Chennai", eta="2026-03-08", refund=0,
              payment_status="Paid", price=5499, created_at="2026-03-01"),
        Order(order_id="TN4005", user_id=4, product_name="Headphones", category="Electronics",
              status="Returned", city="Coimbatore", eta="2026-02-28", refund=1800,
              payment_status="Refunded", price=7999, created_at="2026-02-15"),
    ]
    db.add_all(orders)
    db.commit()

    # =============================
    # ORDER TIMELINES
    # =============================
    all_stages = ["Ordered", "Packed", "Shipped", "Out for Delivery", "Delivered"]

    def make_timeline(oid, status):
        stages = []
        status_stage_map = {
            "Pending": 1, "In Transit": 3, "Delayed": 3,
            "Delivered": 5, "Returned": 5, "Cancelled": 1
        }
        completed_count = status_stage_map.get(status, 1)
        for i, stage in enumerate(all_stages):
            stages.append(OrderTimeline(
                order_id=oid, stage=stage,
                timestamp=f"2026-02-{10+i:02d} 10:00:00" if i < completed_count else "",
                completed=(i < completed_count)
            ))
        return stages

    timelines = []
    for o in orders:
        timelines.extend(make_timeline(o.order_id, o.status))
    db.add_all(timelines)
    db.commit()

    # =============================
    # SAMPLE TICKETS
    # =============================
    tickets = [
        Ticket(ticket_id="TKT-001", order_id="TN1002", user_id=1,
               request_type="return", reason="Product was defective on arrival",
               status="approved", admin_remarks="Return approved. Pickup scheduled.",
               created_at="2026-02-22 14:30:00"),
        Ticket(ticket_id="TKT-002", order_id="TN2004", user_id=2,
               request_type="refund", reason="Order delayed beyond acceptable time",
               status="pending", admin_remarks="",
               created_at="2026-03-09 10:00:00"),
        Ticket(ticket_id="TKT-003", order_id="TN3004", user_id=3,
               request_type="return", reason="Wrong item received",
               status="approved", admin_remarks="Confirmed wrong item. Full refund initiated.",
               created_at="2026-02-20 16:45:00"),
        Ticket(ticket_id="TKT-004", order_id="TN4005", user_id=4,
               request_type="return", reason="Quality not as described",
               status="rejected", admin_remarks="Product matches listing description.",
               created_at="2026-02-28 09:15:00"),
        Ticket(ticket_id="TKT-005", order_id="TN1003", user_id=1,
               request_type="cancel", reason="No longer needed due to delay",
               status="pending", admin_remarks="",
               created_at="2026-03-08 11:20:00"),
    ]
    db.add_all(tickets)
    db.commit()

    # =============================
    # TICKET MESSAGES
    # =============================
    messages = [
        TicketMessage(ticket_id="TKT-001", sender_role="user", sender_name="luffy",
                      message="The laptop screen had a crack when I opened the box.",
                      timestamp="2026-02-22 14:30:00"),
        TicketMessage(ticket_id="TKT-001", sender_role="admin", sender_name="admin",
                      message="We've reviewed your claim. A pickup has been scheduled for tomorrow.",
                      timestamp="2026-02-22 15:00:00"),
        TicketMessage(ticket_id="TKT-002", sender_role="user", sender_name="eren",
                      message="My order TN2004 is delayed by over a week. I want a refund.",
                      timestamp="2026-03-09 10:00:00"),
        TicketMessage(ticket_id="TKT-003", sender_role="user", sender_name="naruto",
                      message="I ordered a Laptop but received a phone case instead.",
                      timestamp="2026-02-20 16:45:00"),
        TicketMessage(ticket_id="TKT-003", sender_role="admin", sender_name="admin",
                      message="We've confirmed the error. Full refund will be processed in 3-5 business days.",
                      timestamp="2026-02-20 17:30:00"),
    ]
    db.add_all(messages)
    db.commit()

    # =============================
    # SAMPLE REVIEWS
    # =============================
    reviews = [
        Review(order_id="TN1001", user_id=1, rating=5,
               review="Fast delivery and great packaging!", created_at="2026-02-16"),
        Review(order_id="TN2003", user_id=2, rating=4,
               review="Good shoes, slightly delayed though.", created_at="2026-02-12"),
        Review(order_id="TN3001", user_id=3, rating=3,
               review="Mobile works fine but box was damaged.", created_at="2026-02-19"),
        Review(order_id="TN4001", user_id=4, rating=5,
               review="Excellent laptop, delivered ahead of schedule!", created_at="2026-02-13"),
        Review(order_id="TN4002", user_id=4, rating=4,
               review="Good quality t-shirt. Happy with purchase.", created_at="2026-02-21"),
    ]
    db.add_all(reviews)
    db.commit()

    # =============================
    # AUDIT LOGS
    # =============================
    audit_logs = [
        AuditLog(action="Ticket Approved", details="TKT-001: Return approved for order TN1002",
                 performed_by="admin", role="admin", timestamp="2026-02-22 15:00:00"),
        AuditLog(action="Ticket Approved", details="TKT-003: Return approved for order TN3004",
                 performed_by="admin", role="admin", timestamp="2026-02-20 17:30:00"),
        AuditLog(action="Ticket Rejected", details="TKT-004: Return rejected for order TN4005",
                 performed_by="admin", role="admin", timestamp="2026-02-28 10:00:00"),
        AuditLog(action="Order Cancelled", details="Order TN1002 cancelled by system after return approval",
                 performed_by="system", role="system", timestamp="2026-02-22 15:05:00"),
        AuditLog(action="System Seed", details="Database seeded with initial data",
                 performed_by="system", role="system", timestamp=now()),
    ]
    db.add_all(audit_logs)
    db.commit()

    # =============================
    # NOTIFICATIONS
    # =============================
    notifications = [
        Notification(user_id=1, message="Your return for TN1002 has been approved!",
                     notification_type="ticket", created_at="2026-02-22 15:00:00"),
        Notification(user_id=1, message="Order TN1001 has been delivered successfully.",
                     notification_type="delivery", created_at="2026-02-15 18:00:00"),
        Notification(user_id=2, message="Your ticket TKT-002 is under review.",
                     notification_type="ticket", created_at="2026-03-09 10:05:00"),
        Notification(user_id=3, message="Refund of ₹3500 processed for TN3004.",
                     notification_type="refund", created_at="2026-02-21 12:00:00"),
        Notification(user_id=4, message="Your return request for TN4005 was rejected.",
                     notification_type="ticket", created_at="2026-02-28 10:00:00"),
        Notification(user_id=4, message="Order TN4001 delivered! Leave a review.",
                     notification_type="delivery", created_at="2026-02-12 16:00:00"),
    ]
    db.add_all(notifications)
    db.commit()

    db.close()
    print("✅ Database seeded with enterprise demo data")