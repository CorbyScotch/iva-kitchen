import API from "./api";

export const getMenuItems = (category) =>
  API.get("/menu", { params: { category } });

export const getFeaturedItems = () => API.get("/menu/featured");
export const getMenuItem = (id) => API.get(`/menu/${id}`);
export const createMenuItem = (data) => API.post("/menu", data);
export const updateMenuItem = (id, data) => API.put(`/menu/${id}`, data);
export const deleteMenuItem = (id) => API.delete(`/menu/${id}`);
