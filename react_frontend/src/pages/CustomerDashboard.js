import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import OrderCard from "../components/OrderCard";
import ChatWindow from "../components/ChatWindow";
import { getOrders, cancelOrder } from "../services/api";

export default function CustomerDashboard({ user, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const data = await getOrders(user.user_id);
    setOrders(data);
    setLoading(false);
  };

  const handleCancelOrder = async (orderId) => {
    const res = await cancelOrder(orderId);
    if (res.success) {
      // Optimistically update the UI to keep it snappy
      setOrders(orders.map(o => o.order_id === orderId ? { ...o, status: "Cancelled", refund: res.refund } : o));
    } else {
      alert("Failed to cancel order: " + res.error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.user_id]);

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="mb-10 animate-[fadeIn_0.5s_ease-out] flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white">
            Active <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-2 block sm:inline">Shipments</span>
          </h1>
          <p className="text-gray-400">Monitor your logistics and coordinate with JackShelby Core AI</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="glass-button px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 group"
        >
          <span className={`transition-transform duration-500 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`}>↻</span>
          Refresh
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side: Order Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-[fadeIn_1s_ease-out]">
              {orders.map((order, index) => (
                <div key={order.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-[slideUp_0.5s_ease-out_both]">
                  <OrderCard order={order} onCancel={handleCancelOrder} />
                </div>
              ))}
              {orders.length === 0 && (
                <div className="col-span-2 glass-panel p-10 flex text-center justify-center rounded-2xl">
                  <p className="text-gray-400">No active shipments found in the registry.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Sticky AI Module */}
        <div className="w-full lg:w-[400px] xl:w-[450px]">
          <div className="sticky top-8 animate-[slideUp_1s_ease-out_both] delay-500">
            <ChatWindow userId={user.user_id} />
          </div>
        </div>
      </div>
    </Layout>
  );
}