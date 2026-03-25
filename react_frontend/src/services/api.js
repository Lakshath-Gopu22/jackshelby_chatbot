const API_BASE = "http://localhost:8000";

// =============================
// AUTH
// =============================
export async function login(username, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return await res.json();
}

// =============================
// ORDERS
// =============================
export async function getOrders(userId) {
  const res = await fetch(`${API_BASE}/orders/${userId}`);
  return await res.json();
}

export async function getOrderDetail(orderId) {
  const res = await fetch(`${API_BASE}/orders/detail/${orderId}`);
  return await res.json();
}

export async function cancelOrder(orderId) {
  const res = await fetch(`${API_BASE}/orders/${orderId}/cancel`, { method: "POST" });
  return await res.json();
}

// =============================
// TICKETS
// =============================
export async function getAllTickets() {
  const res = await fetch(`${API_BASE}/tickets`);
  return await res.json();
}

export async function getUserTickets(userId) {
  const res = await fetch(`${API_BASE}/tickets/user/${userId}`);
  return await res.json();
}

export async function getTicketDetail(ticketId) {
  const res = await fetch(`${API_BASE}/tickets/${ticketId}`);
  return await res.json();
}

export async function createTicket(orderId, requestType, reason) {
  const res = await fetch(`${API_BASE}/tickets/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order_id: orderId, request_type: requestType, reason }),
  });
  return await res.json();
}

export async function approveTicket(ticketId, adminRemarks) {
  const res = await fetch(`${API_BASE}/tickets/${ticketId}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ admin_remarks: adminRemarks }),
  });
  return await res.json();
}

export async function rejectTicket(ticketId, adminRemarks) {
  const res = await fetch(`${API_BASE}/tickets/${ticketId}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ admin_remarks: adminRemarks }),
  });
  return await res.json();
}

export async function addTicketMessage(ticketId, senderRole, message) {
  const res = await fetch(`${API_BASE}/tickets/${ticketId}/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sender_role: senderRole, message }),
  });
  return await res.json();
}

// =============================
// REVIEWS
// =============================
export async function createReview(orderId, rating, review) {
  const res = await fetch(`${API_BASE}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order_id: orderId, rating, review }),
  });
  return await res.json();
}

export async function getAllReviews() {
  const res = await fetch(`${API_BASE}/reviews`);
  return await res.json();
}

// =============================
// NOTIFICATIONS
// =============================
export async function getNotifications(userId) {
  const res = await fetch(`${API_BASE}/notifications/${userId}`);
  return await res.json();
}

export async function markAllRead(userId) {
  const res = await fetch(`${API_BASE}/notifications/${userId}/read-all`, { method: "POST" });
  return await res.json();
}

// =============================
// ADMIN
// =============================
export async function getAdminInsights() {
  const res = await fetch(`${API_BASE}/admin/insights`);
  return await res.json();
}

export async function getAllOrders() {
  const res = await fetch(`${API_BASE}/admin/all_orders`);
  return await res.json();
}

export async function getCustomers() {
  const res = await fetch(`${API_BASE}/admin/customers`);
  return await res.json();
}

export async function getAdminAnalytics() {
  const res = await fetch(`${API_BASE}/admin/analytics`);
  return await res.json();
}

export async function getAuditLogs() {
  const res = await fetch(`${API_BASE}/admin/audit-logs`);
  return await res.json();
}

export async function getAiInsights() {
  const res = await fetch(`${API_BASE}/admin/ai-insights`);
  return await res.json();
}

// =============================
// CHAT
// =============================
export async function sendMessage(userId, message) {
  const res = await fetch(`${API_BASE}/chat/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return await res.json();
}