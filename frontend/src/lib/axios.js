import axios from "axios";

const isDev = import.meta.env.MODE === "development";

const BASE_URL = isDev
  ? "http://localhost:5001/api"
  : `api.${window.location.origin}/api`;   // tự động lấy dns

const api = axios.create({
  baseURL: BASE_URL,
  // Nếu cần credentials (cookie, auth) thì thêm:
  // withCredentials: true,
});

export default api;