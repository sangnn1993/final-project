import axios from "axios";

const isDev = import.meta.env.MODE === "development";

const BASE_URL = isDev
  ? "http://localhost:5001/api"
  : `https://api.fastinvest.cloud/api`;

const api = axios.create({
  baseURL: BASE_URL,
  // Nếu cần credentials (cookie, auth) thì thêm:
  // withCredentials: true,
});

export default api;