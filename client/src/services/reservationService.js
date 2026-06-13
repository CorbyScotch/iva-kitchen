import API from "./api";

export const createReservation = (data) => API.post("/reservations", data);
export const getMyReservations = () => API.get("/reservations/my");
export const getAllReservations = () => API.get("/reservations");
export const updateReservationStatus = (id, status) =>
  API.put(`/reservations/${id}/status`, { status });
export const cancelReservation = (id) => API.put(`/reservations/${id}/cancel`);
