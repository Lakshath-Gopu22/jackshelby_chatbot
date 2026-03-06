const API_BASE = "https://jackshelby-chatbot.onrender.com";

export async function login(username, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: username,
      password: password
    })
  });

  return await res.json();
}

export async function getOrders(userId) {
  const res = await fetch(`${API_BASE}/orders/${userId}`);
  return await res.json();
}

export async function cancelOrder(orderId) {
  const res = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
    method: "POST"
  });
  return await res.json();
}

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

export async function sendMessage(userId, message) {
  const res = await fetch(`${API_BASE}/chat/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: message
    })
  });

  return await res.json();
}