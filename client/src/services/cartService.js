import API from "./api";

export const getCart = () => API.get("/cart");
export const addToCart = (item) => API.post("/cart", item);
export const updateCartItem = (itemId, quantity) =>
  API.put(`/cart/${itemId}`, { quantity });
export const removeFromCart = (itemId) => API.delete(`/cart/${itemId}`);
export const clearCart = () => API.delete("/cart");
