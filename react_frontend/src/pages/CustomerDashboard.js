import { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import OrderCard from "../components/OrderCard";
import ChatWindow from "../components/ChatWindow";
import OrderDetailModal from "../components/OrderDetailModal";
import ReviewModal from "../components/ReviewModal";
import TicketDetailModal from "../components/TicketDetailModal";
import { getOrders, cancelOrder, getUserTickets, createTicket } from "../services/api";

const TABS = [
  { id: "orders", label: "My Orders", icon: "📦" },
  { id: "tickets", label: "My Tickets", icon: "🎫" },
  { id: "chat", label: "AI Assistant", icon: "🤖" },
];

export default function CustomerDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [ticketForm, setTicketForm] = useState({ orderId: "", type: "cancel", reason: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [ordersData, ticketsData] = await Promise.all([
      getOrders(user.user_id),
      getUserTickets(user.user_id),
    ]);
    setOrders(Array.isArray(ordersData) ? ordersData : []);
    setTickets(Array.isArray(ticketsData) ? ticketsData : []);
    setLoading(false);
  }, [user.user_id]);

  const handleCancelOrder = async (orderId) => {
    const res = await cancelOrder(orderId);
    if (res.success) {
      setOrders(orders.map(o => o.order_id === orderId ? { ...o, status: "Cancelled", refund: res.refund } : o));
    } else {
      alert("Failed: " + res.error);
    }
  };

  const handleCreateTicket = async () => {
    if (!ticketForm.orderId || !ticketForm.reason) return;
    const res = await createTicket(ticketForm.orderId, ticketForm.type, ticketForm.reason);
    if (res.success) {
      setShowCreateTicket(false);
      setTicketForm({ orderId: "", type: "cancel", reason: "" });
      fetchData();
    }
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  const tabsWithBadges = TABS.map(t => ({
    ...t,
    badge: t.id === "tickets" ? tickets.filter(tk => tk.status === "pending").length : 0,
  }));

  return (
    <Layout user={user} onLogout={onLogout} activeTab={activeTab} onTabChange={setActiveTab} tabs={tabsWithBadges}>
      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="animate-fade-in">
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-white">
                Active <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Shipments</span>
              </h1>
              <p className="text-gray-400 text-sm mt-1">Monitor your logistics and coordinate with JackShelby AI</p>
            </div>
            <button onClick={fetchData} disabled={loading}
              className="glass-button px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 group">
              <span className={`transition-transform duration-500 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`}>↻</span>
              Refresh
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  {orders.map((order, i) => (
                    <div key={order.id} style={{ animationDelay: `${i * 0.08}s` }} className="animate-slide-up">
                      <OrderCard
                        order={order}
                        onCancel={handleCancelOrder}
                        onReview={(o) => setReviewOrder(o)}
                        onViewDetail={(id) => setSelectedOrder(id)}
                      />
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <div className="col-span-2 glass-panel p-10 text-center rounded-2xl">
                      <p className="text-gray-400">No active shipments found.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="w-full lg:w-[400px]">
              <div className="sticky top-6">
                <ChatWindow userId={user.user_id} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tickets Tab */}
      {activeTab === "tickets" && (
        <div className="animate-fade-in">
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-white">
                Support <span className="text-transparent bg-clip-text bg-gradient-to-r from-warning to-danger">Tickets</span>
              </h1>
              <p className="text-gray-400 text-sm mt-1">Track your cancellation, return, and refund requests</p>
            </div>
            <button onClick={() => setShowCreateTicket(true)}
              className="px-4 py-2.5 bg-primary/20 text-primary border border-primary/30 rounded-xl text-sm font-bold hover:bg-primary/30 transition-all">
              + New Ticket
            </button>
          </div>

          {/* Tickets List */}
          <div className="space-y-3">
            {tickets.map((t) => (
              <div key={t.id}
                onClick={() => setSelectedTicket(t.ticket_id)}
                className="glass-panel p-4 rounded-xl cursor-pointer hover:bg-white/10 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                    t.request_type === "cancel" ? "bg-danger/10 text-danger" :
                    t.request_type === "return" ? "bg-warning/10 text-warning" :
                    "bg-primary/10 text-primary"
                  }`}>
                    {t.request_type === "cancel" ? "✕" : t.request_type === "return" ? "↩" : "💰"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-primary">{t.ticket_id}</span>
                      <span className="text-gray-500 text-xs">•</span>
                      <span className="text-gray-400 text-xs">{t.order_id}</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-0.5">{t.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                    t.status === "approved" ? "bg-success/20 text-success" :
                    t.status === "rejected" ? "bg-danger/20 text-danger" :
                    "bg-warning/20 text-warning"
                  }`}>{t.status}</span>
                  <span className="text-gray-500 group-hover:text-white transition-colors">→</span>
                </div>
              </div>
            ))}
            {tickets.length === 0 && (
              <div className="glass-panel p-10 text-center rounded-2xl">
                <p className="text-gray-400">No support tickets. Create one if you need assistance.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Tab (Mobile friendly) */}
      {activeTab === "chat" && (
        <div className="animate-fade-in max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-black tracking-tighter text-white">
              AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Assistant</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">Voice-enabled logistics support powered by JackShelby AI</p>
          </div>
          <ChatWindow userId={user.user_id} />
        </div>
      )}

      {/* Modals */}
      {selectedOrder && (
        <OrderDetailModal orderId={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
      {reviewOrder && (
        <ReviewModal
          orderId={reviewOrder.order_id}
          productName={reviewOrder.product_name}
          onClose={() => setReviewOrder(null)}
          onSubmitted={() => fetchData()}
        />
      )}
      {selectedTicket && (
        <TicketDetailModal
          ticketId={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          isAdmin={false}
          onUpdate={fetchData}
        />
      )}
      {showCreateTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" onClick={() => setShowCreateTicket(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div className="relative glass-panel rounded-3xl w-full max-w-md modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Create Support Ticket</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">Order ID</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50"
                  value={ticketForm.orderId}
                  onChange={(e) => setTicketForm({...ticketForm, orderId: e.target.value})}
                >
                  <option value="">Select order...</option>
                  {orders.map(o => <option key={o.order_id} value={o.order_id}>{o.order_id} - {o.product_name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">Request Type</label>
                <div className="flex gap-2">
                  {["cancel", "return", "refund"].map(t => (
                    <button key={t} onClick={() => setTicketForm({...ticketForm, type: t})}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${
                        ticketForm.type === t ? "bg-primary/20 text-primary border border-primary/30" : "bg-white/5 text-gray-400 border border-white/10"
                      }`}>{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">Reason</label>
                <textarea
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 resize-none"
                  rows={3} value={ticketForm.reason}
                  onChange={(e) => setTicketForm({...ticketForm, reason: e.target.value})}
                  placeholder="Describe your issue..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowCreateTicket(false)}
                  className="flex-1 py-3 border border-white/10 rounded-xl text-sm font-bold text-gray-400 hover:bg-white/5">Cancel</button>
                <button onClick={handleCreateTicket}
                  disabled={!ticketForm.orderId || !ticketForm.reason}
                  className="flex-1 py-3 bg-primary/20 text-primary border border-primary/30 rounded-xl text-sm font-bold hover:bg-primary/30 disabled:opacity-40">
                  Submit Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}