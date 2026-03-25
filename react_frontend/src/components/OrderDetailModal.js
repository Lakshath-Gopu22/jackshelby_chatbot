import { useState, useEffect } from "react";
import { getOrderDetail } from "../services/api";

export default function OrderDetailModal({ orderId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getOrderDetail(orderId);
        setData(res);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();
  }, [orderId]);

  const statusColor = (s) => {
    const map = {
      Delivered: "text-success bg-success/20",
      Returned: "text-danger bg-danger/20",
      "In Transit": "text-primary bg-primary/20",
      Delayed: "text-warning bg-warning/20",
      Pending: "text-gray-300 bg-gray-500/20",
      Cancelled: "text-gray-400 bg-gray-600/20",
    };
    return map[s] || "text-gray-300 bg-gray-500/20";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div
        className="relative glass-panel rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 backdrop-blur-xl bg-background/80 p-6 border-b border-white/10 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Order Details</h2>
            <p className="text-gray-400 text-sm mt-1">
              {orderId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-danger/20 hover:border-danger/30 transition-all text-gray-400 hover:text-danger"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : data ? (
          <div className="p-6 space-y-6">
            {/* Order Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InfoCard label="Order ID" value={data.order.order_id} />
              <InfoCard label="Customer" value={data.user.username} capitalize />
              <InfoCard label="Product" value={data.order.product_name} />
              <InfoCard label="Category" value={data.order.category} />
              <InfoCard label="City" value={data.order.city} />
              <InfoCard label="ETA" value={data.order.eta} highlight />
              <InfoCard label="Price" value={`₹${data.order.price}`} />
              <InfoCard label="Payment" value={data.order.payment_status} />
              <InfoCard label="Refund" value={data.order.refund > 0 ? `₹${data.order.refund}` : "None"} danger={data.order.refund > 0} />
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">Status:</span>
              <span className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider ${statusColor(data.order.status)}`}>
                {data.order.status}
              </span>
            </div>

            {/* Order Timeline */}
            {data.timeline && data.timeline.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="text-primary">⏱</span> Delivery Timeline
                </h3>
                <div className="flex items-center gap-0">
                  {data.timeline.map((step, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center relative">
                      {/* Connector Line */}
                      {i < data.timeline.length - 1 && (
                        <div className={`absolute top-4 left-1/2 w-full h-0.5 ${
                          step.completed ? "bg-success" : "bg-white/10"
                        }`}></div>
                      )}
                      {/* Dot */}
                      <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500 ${
                        step.completed
                          ? "bg-success border-success text-white shadow-[0_0_12px_rgba(52,211,153,0.5)]"
                          : "bg-background border-white/20 text-gray-500"
                      }`}>
                        {step.completed ? "✓" : (i + 1)}
                      </div>
                      {/* Label */}
                      <p className={`text-xs mt-2 text-center leading-tight ${
                        step.completed ? "text-success font-medium" : "text-gray-500"
                      }`}>
                        {step.stage}
                      </p>
                      {step.timestamp && (
                        <p className="text-[10px] text-gray-600 mt-1 text-center">
                          {step.timestamp.split(" ")[0]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tickets */}
            {data.tickets && data.tickets.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span className="text-warning">🎫</span> Related Tickets
                </h3>
                <div className="space-y-2">
                  {data.tickets.map((t) => (
                    <div key={t.ticket_id} className="bg-white/5 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                      <div>
                        <span className="font-mono text-sm text-primary">{t.ticket_id}</span>
                        <span className="text-gray-400 text-sm ml-3">{t.request_type}</span>
                      </div>
                      <span className={`text-xs font-bold uppercase px-3 py-1 rounded-lg ${
                        t.status === "approved" ? "bg-success/20 text-success" :
                        t.status === "rejected" ? "bg-danger/20 text-danger" :
                        "bg-warning/20 text-warning"
                      }`}>{t.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Review */}
            {data.review && (
              <div>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <span className="text-warning">⭐</span> Customer Review
                </h3>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className={`text-lg ${s <= data.review.rating ? "text-warning" : "text-gray-600"}`}>★</span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-300">{data.review.review}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">Failed to load order details</div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ label, value, highlight, capitalize, danger }) {
  return (
    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`font-medium text-sm ${
        danger ? "text-danger" : highlight ? "text-primary" : "text-gray-200"
      } ${capitalize ? "capitalize" : ""}`}>
        {value}
      </p>
    </div>
  );
}
