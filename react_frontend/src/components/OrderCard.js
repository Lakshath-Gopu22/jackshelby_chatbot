export default function OrderCard({ order, onCancel }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered": return "bg-success/20 text-success border-success/30";
      case "Returned": return "bg-danger/20 text-danger border-danger/30";
      case "In Transit": return "bg-primary/20 text-primary border-primary/30";
      case "Delayed": return "bg-warning/20 text-warning border-warning/30";
      default: return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  // Ensure visual progress bar based on status
  const getProgressWidth = (status) => {
    switch (status) {
      case "Delivered": return "100%";
      case "Returned": return "100%";
      case "Delayed": return "60%";
      case "In Transit": return "70%";
      case "Pending": return "10%";
      default: return "50%";
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="font-bold text-xl text-white flex items-center gap-2">
              <span className="text-gray-500">#</span>{order.order_id}
            </h3>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-mono">
              Tracker: {order.tracking_number || "AWAITING"}
            </p>
          </div>
          <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5 text-sm">
          <div>
            <p className="text-gray-500 mb-1 text-xs uppercase tracking-wide">Destination</p>
            <p className="text-gray-200 font-medium">{order.city}</p>
            <p className="text-xs text-gray-400 mt-0.5 truncate" title={order.shipping_address}>{order.shipping_address || "Address pending"}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1 text-xs uppercase tracking-wide">Est. Arrival</p>
            <p className="text-primary font-medium">{order.eta}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1 text-xs uppercase tracking-wide">Courier</p>
            <p className="text-gray-300">{order.courier_name || "Unassigned"}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1 text-xs uppercase tracking-wide">Parameters</p>
            <p className="text-gray-300">{order.weight_kg ? `${order.weight_kg} KG` : "N/A"}</p>
            {order.refund > 0 && <p className="text-danger mt-1">Refund: ₹{order.refund}</p>}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/5 relative">
          <div className="flex justify-between text-xs text-gray-500 mb-2 font-mono uppercase">
            <span>Origin</span>
            <span>Destination</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-4">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${order.status === 'Delayed' ? 'bg-warning' : order.status === 'Returned' ? 'bg-danger' : order.status === 'Delivered' ? 'bg-success' : 'bg-primary'}`}
              style={{ width: getProgressWidth(order.status) }}
            ></div>
          </div>

          {/* Cancellation Policy rendering */}
          {(order.status === "Pending" || order.status === "In Transit") && (
            <div className="flex justify-between items-center bg-danger/5 border border-danger/10 p-3 rounded-xl mt-4">
              <div className="text-xs text-danger/80">
                <p className="font-bold">Cancellation Available</p>
                <p>Eligible for full refund minus processing fee.</p>
              </div>
              <button
                onClick={() => onCancel(order.order_id)}
                className="bg-danger/20 hover:bg-danger text-danger hover:text-white border border-danger/30 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
              >
                Cancel Order
              </button>
            </div>
          )}
          {order.status === "Cancelled" && (
            <div className="flex justify-between items-center bg-gray-500/10 border border-gray-500/20 p-3 rounded-xl mt-4">
              <div className="text-xs text-gray-400">
                <p className="font-bold">Order Cancelled</p>
                <p>Refund processed according to policy.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}