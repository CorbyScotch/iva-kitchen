import axios from "axios";

// Create an axios instance with our backend URL as the base
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Before every request, automatically attach the token if the user is logged in
// This is like the waiter automatically showing their staff badge before entering the kitchen
API.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem("userInfo");
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
