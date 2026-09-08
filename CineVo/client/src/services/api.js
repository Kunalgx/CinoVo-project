import axios from "axios";
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
  timeout: 15000,
});
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401)
      window.dispatchEvent(new Event("cinevo:unauthorized"));
    return Promise.reject(err);
  },
);
