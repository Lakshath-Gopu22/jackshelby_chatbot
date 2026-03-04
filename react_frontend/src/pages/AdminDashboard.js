import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { getAdminInsights, getAllOrders, getCustomers } from "../services/api";

export default function AdminDashboard({ user, onLogout }) {
  const [data, setData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchData() {
      const [insightsRes, ordersRes, customersRes] = await Promise.all([
        getAdminInsights(),
        getAllOrders(),
        getCustomers()
      ]);
      setData(insightsRes);
      setOrders(ordersRes);
      setCustomers(customersRes);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="flex justify-center items-center h-full">
          <div className="w-16 h-16 border-4 border-danger/20 border-t-danger rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="mb-10 animate-[fadeIn_0.5s_ease-out]">
        <h1 className="text-4xl font-black tracking-tighter text-white">
          Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-danger to-warning mb-2 block sm:inline">Command</span>
        </h1>
        <p className="text-gray-400">System-wide logistics analytics and network control</p>
      </div>

      {/* Bento Grid KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="glass-panel p-6 rounded-2xl col-span-2 lg:col-span-2 bg-gradient-to-br from-white/10 to-transparent">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Total Volume</p>
          <p className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">{data.total_orders}</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <p className="text-xs uppercase tracking-widest text-success mb-2">Delivered</p>
          <p className="text-3xl font-bold">{data.delivered}</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <p className="text-xs uppercase tracking-widest text-primary mb-2">In Transit</p>
          <p className="text-3xl font-bold">{data.in_transit}</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <p className="text-xs uppercase tracking-widest text-warning mb-2">Delayed</p>
          <p className="text-3xl font-bold">{data.delayed}</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-danger/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-danger/10"></div>
          <div className="relative">
            <p className="text-xs uppercase tracking-widest text-danger mb-2">Returned</p>
            <p className="text-3xl font-bold text-white">{data.returned}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Orders Table */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col h-[500px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              Network Registry
              <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">LIVE</span>
            </h3>
            <input
              type="text"
              placeholder="Search registry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-surfaceHover border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 w-64"
            />
          </div>
          <div className="overflow-auto custom-scrollbar pr-2 flex-1">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-gray-500 uppercase bg-white/5 sticky top-0 backdrop-blur-md">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">ID</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">ETA</th>
                  <th className="px-4 py-3 rounded-tr-lg">Refund</th>
                </tr>
              </thead>
              <tbody>
                {orders
                  .filter(o =>
                    o.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    o.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    o.status.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((o) => (
                    <tr key={o.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-mono text-white/80">{o.order_id}</td>
                      <td className="px-4 py-3 capitalize">{o.username}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${o.status === 'Delivered' ? 'bg-success/20 text-success' :
                          o.status === 'Returned' ? 'bg-danger/20 text-danger' :
                            o.status === 'Delayed' ? 'bg-warning/20 text-warning' :
                              'bg-primary/20 text-primary'
                          }`}>{o.status}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{o.eta}</td>
                      <td className="px-4 py-3 text-red-400">{o.refund > 0 ? `₹${o.refund}` : '-'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Ledger */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-[500px]">
          <h3 className="text-xl font-bold mb-4">Client Ledger</h3>
          <div className="overflow-auto custom-scrollbar pr-2 space-y-3 flex-1">
            {customers.map(c => (
              <div key={c.id} className="bg-surfaceHover p-4 rounded-xl border border-white/5 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg capitalize">{c.username}</span>
                  <span className="bg-white/10 text-xs px-2 py-1 rounded font-mono">ID:{c.id}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Orders: {c.orders_count}</span>
                  <span className="text-danger">Refunds: ₹{c.total_refunded}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
}