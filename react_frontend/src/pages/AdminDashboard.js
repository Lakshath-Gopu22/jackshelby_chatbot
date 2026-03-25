import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import OrderDetailModal from "../components/OrderDetailModal";
import TicketDetailModal from "../components/TicketDetailModal";
import {
  getAdminInsights, getAllOrders, getCustomers, getAllTickets,
  getAdminAnalytics, getAuditLogs, getAllReviews, getAiInsights
} from "../services/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const CHART_COLORS = ["#38bdf8", "#34d399", "#fbbf24", "#fb7185", "#818cf8", "#a78bfa"];

const TABS = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "orders", label: "All Orders", icon: "📦" },
  { id: "tickets", label: "Tickets", icon: "🎫" },
  { id: "analytics", label: "Analytics", icon: "📈" },
  { id: "reviews", label: "Reviews", icon: "⭐" },
  { id: "audit", label: "Audit Logs", icon: "📋" },
  { id: "customers", label: "Customers", icon: "👥" },
];

export default function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [insights, setInsights] = useState(null);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [aiInsights, setAiInsights] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [ins, ord, cust, tix, ana, logs, revs] = await Promise.all([
        getAdminInsights(), getAllOrders(), getCustomers(),
        getAllTickets(), getAdminAnalytics(), getAuditLogs(), getAllReviews()
      ]);
      setInsights(ins);
      setOrders(Array.isArray(ord) ? ord : []);
      setCustomers(Array.isArray(cust) ? cust : []);
      setTickets(Array.isArray(tix) ? tix : []);
      setAnalytics(ana);
      setAuditLogs(Array.isArray(logs) ? logs : []);
      setReviews(Array.isArray(revs) ? revs : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function fetchAiInsightsData() {
    setAiInsights("Analyzing...");
    try {
      const res = await getAiInsights();
      setAiInsights(res.insights);
    } catch (e) {
      setAiInsights("Failed to generate insights.");
    }
  }

  const tabsWithBadges = TABS.map(t => ({
    ...t,
    badge: t.id === "tickets" ? tickets.filter(tk => tk.status === "pending").length : 0,
  }));

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout} activeTab={activeTab} onTabChange={setActiveTab} tabs={tabsWithBadges}>
        <div className="flex justify-center items-center h-full">
          <div className="w-16 h-16 border-4 border-danger/20 border-t-danger rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout} activeTab={activeTab} onTabChange={setActiveTab} tabs={tabsWithBadges}>

      {/* ====================== OVERVIEW ====================== */}
      {activeTab === "overview" && insights && (
        <div className="animate-fade-in space-y-6">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white">
              Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-danger to-warning">Command</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">Enterprise logistics control panel</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <KpiCard label="Total" value={insights.total_orders} gradient="from-white/10 to-transparent" span={true} />
            <KpiCard label="Delivered" value={insights.delivered} color="text-success" />
            <KpiCard label="In Transit" value={insights.in_transit} color="text-primary" />
            <KpiCard label="Delayed" value={insights.delayed} color="text-warning" />
            <KpiCard label="Returned" value={insights.returned} color="text-danger" />
            <KpiCard label="Pending" value={insights.pending} color="text-accent" />
            <KpiCard label="Refunded" value={insights.refunded} color="text-danger" />
          </div>

          {/* Quick Charts Row */}
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* City Bar Chart */}
              <div className="glass-panel p-5 rounded-2xl">
                <h3 className="text-base font-bold mb-4">City-wise Orders</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={Object.entries(analytics.city_orders).map(([k, v]) => ({ city: k, orders: v }))}>
                    <XAxis dataKey="city" stroke="#666" fontSize={11} />
                    <YAxis stroke="#666" fontSize={11} />
                    <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                    <Bar dataKey="orders" radius={[6, 6, 0, 0]}>
                      {Object.entries(analytics.city_orders).map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Status Pie Chart */}
              <div className="glass-panel p-5 rounded-2xl">
                <h3 className="text-base font-bold mb-4">Status Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={Object.entries(analytics.status_distribution).map(([k, v]) => ({ name: k, value: v }))}
                      cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                      paddingAngle={4} dataKey="value"
                    >
                      {Object.entries(analytics.status_distribution).map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#999' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* AI Insights Panel */}
          <div className="glass-panel p-5 rounded-2xl border border-primary/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <span className="text-primary">🧠</span> AI Insights
              </h3>
              <button onClick={fetchAiInsightsData}
                className="px-3 py-1.5 bg-primary/20 text-primary border border-primary/30 rounded-lg text-xs font-bold hover:bg-primary/30 transition-all">
                Generate
              </button>
            </div>
            {aiInsights ? (
              <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{aiInsights}</div>
            ) : (
              <p className="text-sm text-gray-500">Click "Generate" to get AI-powered analytics insights</p>
            )}
          </div>
        </div>
      )}

      {/* ====================== ALL ORDERS ====================== */}
      {activeTab === "orders" && (
        <div className="animate-fade-in space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-white">
                Network <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Registry</span>
              </h1>
              <p className="text-gray-400 text-sm mt-1">All orders across the logistics network</p>
            </div>
            <input
              type="text" placeholder="Search orders..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 w-64"
            />
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="overflow-auto max-h-[70vh] custom-scrollbar">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-gray-500 uppercase bg-white/5 sticky top-0 backdrop-blur-md">
                  <tr>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">City</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">ETA</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Refund</th>
                  </tr>
                </thead>
                <tbody>
                  {orders
                    .filter(o =>
                      o.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      o.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      o.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      o.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      o.city.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((o) => (
                      <tr key={o.id}
                        onClick={() => setSelectedOrder(o.order_id)}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3 font-mono text-primary">{o.order_id}</td>
                        <td className="px-4 py-3">{o.product_name}</td>
                        <td className="px-4 py-3 capitalize">{o.username}</td>
                        <td className="px-4 py-3 text-gray-400">{o.city}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                            o.status === 'Delivered' ? 'bg-success/20 text-success' :
                            o.status === 'Returned' ? 'bg-danger/20 text-danger' :
                            o.status === 'Delayed' ? 'bg-warning/20 text-warning' :
                            o.status === 'In Transit' ? 'bg-primary/20 text-primary' :
                            'bg-gray-500/20 text-gray-300'
                          }`}>{o.status}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-400">{o.eta}</td>
                        <td className="px-4 py-3">₹{o.price}</td>
                        <td className="px-4 py-3 text-danger">{o.refund > 0 ? `₹${o.refund}` : '-'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ====================== TICKETS ====================== */}
      {activeTab === "tickets" && (
        <div className="animate-fade-in space-y-6">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white">
              Support <span className="text-transparent bg-clip-text bg-gradient-to-r from-warning to-danger">Tickets</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">Manage customer requests and escalations</p>
          </div>

          {/* Ticket Stats */}
          {analytics && (
            <div className="grid grid-cols-4 gap-3">
              <div className="glass-panel p-4 rounded-xl text-center">
                <p className="text-2xl font-bold">{analytics.ticket_stats.total}</p>
                <p className="text-xs text-gray-400 mt-1">Total</p>
              </div>
              <div className="glass-panel p-4 rounded-xl text-center">
                <p className="text-2xl font-bold text-warning">{analytics.ticket_stats.pending}</p>
                <p className="text-xs text-gray-400 mt-1">Pending</p>
              </div>
              <div className="glass-panel p-4 rounded-xl text-center">
                <p className="text-2xl font-bold text-success">{analytics.ticket_stats.approved}</p>
                <p className="text-xs text-gray-400 mt-1">Approved</p>
              </div>
              <div className="glass-panel p-4 rounded-xl text-center">
                <p className="text-2xl font-bold text-danger">{analytics.ticket_stats.rejected}</p>
                <p className="text-xs text-gray-400 mt-1">Rejected</p>
              </div>
            </div>
          )}

          {/* Tickets List */}
          <div className="space-y-2">
            {tickets.map((t) => (
              <div key={t.id}
                onClick={() => setSelectedTicket(t.ticket_id)}
                className="glass-panel p-4 rounded-xl cursor-pointer hover:bg-white/10 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                    t.status === "pending" ? "bg-warning/10 text-warning" :
                    t.status === "approved" ? "bg-success/10 text-success" :
                    "bg-danger/10 text-danger"
                  }`}>
                    {t.request_type === "cancel" ? "✕" : t.request_type === "return" ? "↩" : "₹"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm text-primary">{t.ticket_id}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-xs text-gray-400">{t.order_id}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-xs capitalize text-gray-400">{t.username}</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-0.5 truncate max-w-md">{t.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                    t.status === "approved" ? "bg-success/20 text-success" :
                    t.status === "rejected" ? "bg-danger/20 text-danger" :
                    "bg-warning/20 text-warning"
                  }`}>{t.status}</span>
                  <span className="text-xs text-gray-500">{t.created_at?.split(" ")[0]}</span>
                  <span className="text-gray-500 group-hover:text-white transition-colors">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====================== ANALYTICS ====================== */}
      {activeTab === "analytics" && analytics && (
        <div className="animate-fade-in space-y-6">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white">
              Advanced <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">Analytics</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">Deep insights into logistics performance</p>
          </div>

          {/* Revenue Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-panel p-5 rounded-2xl">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Total Revenue</p>
              <p className="text-3xl font-bold text-success">₹{analytics.total_revenue?.toLocaleString()}</p>
            </div>
            <div className="glass-panel p-5 rounded-2xl">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Total Refunds</p>
              <p className="text-3xl font-bold text-danger">₹{analytics.total_refunds?.toLocaleString()}</p>
            </div>
            <div className="glass-panel p-5 rounded-2xl">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Avg Rating</p>
              <p className="text-3xl font-bold text-warning">{analytics.avg_rating} ⭐</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* City Delays Chart */}
            <div className="glass-panel p-5 rounded-2xl">
              <h3 className="text-base font-bold mb-4">🏙️ City-wise Delays</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={Object.entries(analytics.city_delays).map(([k, v]) => ({ city: k, delays: v }))}>
                  <XAxis dataKey="city" stroke="#666" fontSize={11} />
                  <YAxis stroke="#666" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                  <Bar dataKey="delays" fill="#fbbf24" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Product Returns Chart */}
            <div className="glass-panel p-5 rounded-2xl">
              <h3 className="text-base font-bold mb-4">📦 Product Returns</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={Object.entries(analytics.product_returns).map(([k, v]) => ({ product: k, returns: v }))}>
                  <XAxis dataKey="product" stroke="#666" fontSize={11} />
                  <YAxis stroke="#666" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                  <Bar dataKey="returns" fill="#fb7185" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Insights */}
          <div className="glass-panel p-5 rounded-2xl border border-primary/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold flex items-center gap-2">🧠 AI Analysis</h3>
              <button onClick={fetchAiInsightsData}
                className="px-3 py-1.5 bg-primary/20 text-primary border border-primary/30 rounded-lg text-xs font-bold hover:bg-primary/30 transition-all">
                Analyze
              </button>
            </div>
            {aiInsights ? (
              <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{aiInsights}</div>
            ) : (
              <p className="text-sm text-gray-500">Click "Analyze" for AI-powered insights about your logistics</p>
            )}
          </div>
        </div>
      )}

      {/* ====================== REVIEWS ====================== */}
      {activeTab === "reviews" && (
        <div className="animate-fade-in space-y-6">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white">
              Customer <span className="text-transparent bg-clip-text bg-gradient-to-r from-warning to-warning/60">Reviews</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">Feedback and ratings from customers</p>
          </div>

          {/* Rating Summary */}
          {analytics && (
            <div className="glass-panel p-5 rounded-2xl flex items-center gap-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-warning">{analytics.avg_rating}</p>
                <div className="flex gap-0.5 mt-1">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className={`text-sm ${s <= Math.round(analytics.avg_rating) ? "text-warning" : "text-gray-600"}`}>★</span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">{reviews.length} reviews</p>
              </div>
              <div className="h-16 w-px bg-white/10"></div>
              <div className="flex-1 space-y-1">
                {[5,4,3,2,1].map(star => {
                  const count = reviews.filter(r => r.rating === star).length;
                  const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="text-gray-400 w-3">{star}</span>
                      <span className="text-warning text-xs">★</span>
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-warning rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                      <span className="text-gray-500 w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <div key={r.id} className="glass-panel p-4 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-bold capitalize">{r.username}</span>
                    <span className="text-gray-500 text-xs ml-2">{r.order_id}</span>
                  </div>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={`text-sm ${s <= r.rating ? "text-warning" : "text-gray-600"}`}>★</span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-primary mb-2">{r.product_name}</p>
                <p className="text-sm text-gray-300">{r.review}</p>
                <p className="text-xs text-gray-500 mt-2">{r.created_at}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====================== AUDIT LOGS ====================== */}
      {activeTab === "audit" && (
        <div className="animate-fade-in space-y-6">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white">
              Audit <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">Trail</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">Complete history of system actions and admin decisions</p>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="glass-panel p-4 rounded-xl flex items-start gap-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${
                  log.action.includes("Approved") ? "bg-success/10 text-success" :
                  log.action.includes("Rejected") ? "bg-danger/10 text-danger" :
                  log.action.includes("Created") ? "bg-primary/10 text-primary" :
                  "bg-white/5 text-gray-400"
                }`}>
                  {log.action.includes("Approved") ? "✓" :
                   log.action.includes("Rejected") ? "✕" :
                   log.action.includes("Created") ? "+" : "●"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm">{log.action}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-gray-400 capitalize">{log.performed_by}</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-0.5">{log.details}</p>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0 whitespace-nowrap">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====================== CUSTOMERS ====================== */}
      {activeTab === "customers" && (
        <div className="animate-fade-in space-y-6">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white">
              Client <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Ledger</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">Customer accounts and order summaries</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {customers.map(c => (
              <div key={c.id} className="glass-panel p-5 rounded-2xl">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center font-bold text-lg capitalize">
                      {c.username[0]}
                    </div>
                    <div>
                      <p className="font-bold capitalize">{c.username}</p>
                      <p className="text-xs text-gray-500">ID: {c.id}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Orders</span>
                    <span className="font-bold">{c.orders_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Refunds</span>
                    <span className="text-danger font-bold">₹{c.total_refunded}</span>
                  </div>
                  {c.avg_rating && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avg Rating</span>
                      <span className="text-warning font-bold">{c.avg_rating} ★</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedOrder && (
        <OrderDetailModal orderId={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
      {selectedTicket && (
        <TicketDetailModal
          ticketId={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          isAdmin={true}
          onUpdate={fetchAll}
        />
      )}
    </Layout>
  );
}

function KpiCard({ label, value, color, gradient, span }) {
  return (
    <div className={`glass-panel p-4 rounded-xl ${gradient ? `bg-gradient-to-br ${gradient}` : ""} ${span ? "col-span-2 lg:col-span-1" : ""}`}>
      <p className={`text-[10px] uppercase tracking-widest mb-1 ${color || "text-gray-400"}`}>{label}</p>
      <p className={`text-2xl font-bold ${color || ""}`}>{value}</p>
    </div>
  );
}