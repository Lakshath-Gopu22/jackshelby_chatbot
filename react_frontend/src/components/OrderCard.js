export default function OrderCard({ order, onCancel, onReview, onViewDetail }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered": return "bg-success/20 text-success border-success/30";
      case "Returned": return "bg-danger/20 text-danger border-danger/30";
      case "In Transit": return "bg-primary/20 text-primary border-primary/30";
      case "Delayed": return "bg-warning/20 text-warning border-warning/30";
      case "Cancelled": return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      case "Pending": return "bg-accent/20 text-accent border-accent/30";
      default: return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

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
    <div className="glass-panel p-5 rounded-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-3 border-b border-white/10 pb-3">
          <div>
            <h3
              className="font-bold text-lg text-white flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
              onClick={() => onViewDetail && onViewDetail(order.order_id)}
            >
              <span className="text-gray-500">#</span>{order.order_id}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 font-medium">{order.product_name || "Product"}</p>
          </div>
          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div>
            <p className="text-gray-500 mb-0.5 text-[10px] uppercase tracking-wide">Destination</p>
            <p className="text-gray-200 font-medium text-sm">{order.city}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-0.5 text-[10px] uppercase tracking-wide">Est. Arrival</p>
            <p className="text-primary font-medium text-sm">{order.eta}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-0.5 text-[10px] uppercase tracking-wide">Price</p>
            <p className="text-gray-300 text-sm">₹{order.price || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-0.5 text-[10px] uppercase tracking-wide">Payment</p>
            <p className="text-gray-300 text-sm">{order.payment_status || "N/A"}</p>
            {order.refund > 0 && <p className="text-danger text-sm mt-0.5">Refund: ₹{order.refund}</p>}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="flex justify-between text-[10px] text-gray-500 mb-1.5 font-mono uppercase">
            <span>Origin</span>
            <span>Destination</span>
          </div>
          <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                order.status === 'Delayed' ? 'bg-warning' :
                order.status === 'Returned' ? 'bg-danger' :
                order.status === 'Delivered' ? 'bg-success' : 'bg-primary'
              }`}
              style={{ width: getProgressWidth(order.status) }}
            ></div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {/* Cancel Button */}
            {(order.status === "Pending" || order.status === "In Transit") && (
              <button
                onClick={() => onCancel(order.order_id)}
                className="flex-1 bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 text-xs font-bold px-3 py-2 rounded-lg transition-all"
              >
                Cancel Order
              </button>
            )}

            {/* Review Button */}
            {order.status === "Delivered" && onReview && (
              <button
                onClick={() => onReview(order)}
                className="flex-1 bg-warning/10 hover:bg-warning/20 text-warning border border-warning/20 text-xs font-bold px-3 py-2 rounded-lg transition-all"
              >
                ⭐ Leave Review
              </button>
            )}

            {/* View Detail */}
            <button
              onClick={() => onViewDetail && onViewDetail(order.order_id)}
              className="bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-xs font-bold px-3 py-2 rounded-lg transition-all"
            >
              View
            </button>
          </div>

          {order.status === "Cancelled" && (
            <div className="bg-gray-500/10 border border-gray-500/20 p-2.5 rounded-lg mt-2 text-xs text-gray-400">
              <span className="font-bold">Cancelled</span> • Refund processed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}