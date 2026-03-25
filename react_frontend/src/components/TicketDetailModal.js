import { useState, useEffect, useRef } from "react";
import { getTicketDetail, approveTicket, rejectTicket, addTicketMessage } from "../services/api";

export default function TicketDetailModal({ ticketId, onClose, isAdmin, onUpdate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState("");
  const [newMsg, setNewMsg] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [ticketId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [data]);

  async function load() {
    try {
      const res = await getTicketDetail(ticketId);
      setData(res);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function handleApprove() {
    if (!remarks.trim()) return;
    setActionLoading(true);
    await approveTicket(ticketId, remarks);
    await load();
    setRemarks("");
    setActionLoading(false);
    onUpdate && onUpdate();
  }

  async function handleReject() {
    if (!remarks.trim()) return;
    setActionLoading(true);
    await rejectTicket(ticketId, remarks);
    await load();
    setRemarks("");
    setActionLoading(false);
    onUpdate && onUpdate();
  }

  async function handleSendMsg() {
    if (!newMsg.trim()) return;
    await addTicketMessage(ticketId, isAdmin ? "admin" : "user", newMsg);
    setNewMsg("");
    await load();
  }

  const statusBadge = (s) => {
    const map = {
      pending: "bg-warning/20 text-warning",
      approved: "bg-success/20 text-success",
      rejected: "bg-danger/20 text-danger",
    };
    return map[s] || "bg-gray-500/20 text-gray-300";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div
        className="relative glass-panel rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold">Ticket Details</h2>
            <p className="text-gray-400 text-sm mt-1">{ticketId}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-danger/20 hover:border-danger/30 transition-all text-gray-400 hover:text-danger"
          >✕</button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : data ? (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">
            {/* Ticket Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <p className="text-xs text-gray-500 uppercase mb-1">Type</p>
                <p className="font-medium text-sm capitalize text-primary">{data.ticket.request_type}</p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <p className="text-xs text-gray-500 uppercase mb-1">Status</p>
                <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${statusBadge(data.ticket.status)}`}>
                  {data.ticket.status}
                </span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <p className="text-xs text-gray-500 uppercase mb-1">Customer</p>
                <p className="font-medium text-sm capitalize">{data.user.username}</p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <p className="text-xs text-gray-500 uppercase mb-1">Created</p>
                <p className="font-medium text-sm text-gray-300">{data.ticket.created_at?.split(" ")[0]}</p>
              </div>
            </div>

            {/* Reason */}
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <p className="text-xs text-gray-500 uppercase mb-2">Reason</p>
              <p className="text-sm text-gray-200">{data.ticket.reason}</p>
            </div>

            {/* Linked Order */}
            {data.order && (
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <p className="text-xs text-gray-500 uppercase mb-3">Linked Order</p>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs">Order</span>
                    <p className="font-mono text-primary">{data.order.order_id}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Product</span>
                    <p>{data.order.product_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Price</span>
                    <p>₹{data.order.price}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">City</span>
                    <p>{data.order.city}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Status</span>
                    <p>{data.order.status}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Payment</span>
                    <p>{data.order.payment_status}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            {data.timeline && data.timeline.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 uppercase mb-3">Order Timeline</p>
                <div className="flex items-center gap-0">
                  {data.timeline.map((step, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center relative">
                      {i < data.timeline.length - 1 && (
                        <div className={`absolute top-3 left-1/2 w-full h-0.5 ${step.completed ? "bg-success" : "bg-white/10"}`}></div>
                      )}
                      <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                        step.completed ? "bg-success border-success text-white" : "bg-background border-white/20 text-gray-500"
                      }`}>
                        {step.completed ? "✓" : ""}
                      </div>
                      <p className={`text-[10px] mt-1 text-center ${step.completed ? "text-success" : "text-gray-500"}`}>
                        {step.stage}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Thread */}
            <div>
              <p className="text-xs text-gray-500 uppercase mb-3">💬 Conversation</p>
              <div ref={scrollRef} className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                {data.messages.map((m, i) => (
                  <div key={i} className={`flex ${m.sender_role === "admin" ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      m.sender_role === "admin"
                        ? "bg-primary/10 border border-primary/20 rounded-bl-sm"
                        : "bg-white/10 border border-white/10 rounded-br-sm"
                    }`}>
                      <p className={`text-[10px] font-bold uppercase mb-1 ${
                        m.sender_role === "admin" ? "text-primary" : "text-gray-400"
                      }`}>{m.sender_name}</p>
                      <p className="text-gray-200 leading-relaxed">{m.message}</p>
                      <p className="text-[10px] text-gray-500 mt-1">{m.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="flex gap-2 mt-3">
                <input
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMsg()}
                  placeholder="Type a message..."
                />
                <button
                  onClick={handleSendMsg}
                  disabled={!newMsg.trim()}
                  className="px-4 py-2.5 bg-primary/20 text-primary border border-primary/30 rounded-xl text-sm font-bold hover:bg-primary/30 transition-all disabled:opacity-40"
                >
                  Send
                </button>
              </div>
            </div>

            {/* Admin Actions */}
            {isAdmin && data.ticket.status === "pending" && (
              <div className="border-t border-white/10 pt-5">
                <p className="text-xs text-gray-500 uppercase mb-3">Admin Actions</p>
                <textarea
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 resize-none"
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter admin remarks before approving/rejecting..."
                />
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading || !remarks.trim()}
                    className="flex-1 py-3 bg-success/20 text-success border border-success/30 rounded-xl font-bold text-sm hover:bg-success/30 transition-all disabled:opacity-40"
                  >
                    {actionLoading ? "Processing..." : "✓ Approve"}
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={actionLoading || !remarks.trim()}
                    className="flex-1 py-3 bg-danger/20 text-danger border border-danger/30 rounded-xl font-bold text-sm hover:bg-danger/30 transition-all disabled:opacity-40"
                  >
                    {actionLoading ? "Processing..." : "✕ Reject"}
                  </button>
                </div>
              </div>
            )}

            {/* Admin Remarks (if resolved) */}
            {data.ticket.admin_remarks && data.ticket.status !== "pending" && (
              <div className={`p-4 rounded-xl border ${
                data.ticket.status === "approved" ? "bg-success/5 border-success/20" : "bg-danger/5 border-danger/20"
              }`}>
                <p className="text-xs text-gray-500 uppercase mb-1">Admin Remarks</p>
                <p className="text-sm text-gray-200">{data.ticket.admin_remarks}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">Failed to load ticket</div>
        )}
      </div>
    </div>
  );
}
