import { useState, useEffect, useRef } from "react";
import { getNotifications, markAllRead } from "../services/api";

export default function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const unread = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [userId]);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function fetchNotifs() {
    try {
      const data = await getNotifications(userId);
      setNotifications(data);
    } catch (e) {}
  }

  async function handleMarkRead() {
    await markAllRead(userId);
    fetchNotifs();
  }

  const typeIcon = (type) => {
    switch (type) {
      case "ticket": return "🎫";
      case "delivery": return "📦";
      case "refund": return "💰";
      default: return "🔔";
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
      >
        <span className="text-lg">🔔</span>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white text-xs rounded-full flex items-center justify-center font-bold notif-badge">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 glass-panel rounded-2xl border border-white/10 shadow-2xl z-50 animate-slide-down overflow-hidden">
          <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <h4 className="font-bold text-sm">Notifications</h4>
            {unread > 0 && (
              <button
                onClick={handleMarkRead}
                className="text-xs text-primary hover:text-primary/80 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">No notifications</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-white/5 flex gap-3 items-start transition-colors ${
                    n.is_read ? "opacity-60" : "bg-white/5"
                  }`}
                >
                  <span className="text-lg mt-0.5">{typeIcon(n.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 leading-relaxed">{n.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{n.created_at}</p>
                  </div>
                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
