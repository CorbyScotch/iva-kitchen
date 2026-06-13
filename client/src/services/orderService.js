import API from "./api";

export const createOrder = (orderData) => API.post("/orders", orderData);
export const getMyOrders = () => API.get("/orders/myorders");
export const getOrder = (id) => API.get(`/orders/${id}`);
export const getAllOrders = () => API.get("/orders");
export const updateOrderStatus = (id, status) =>
  API.put(`/orders/${id}/status`, { status });
export const updatePaymentStatus = (id, paystackReference) =>
  API.put(`/orders/${id}/payment`, { paystackReference });
