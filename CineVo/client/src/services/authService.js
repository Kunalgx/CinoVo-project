import { api } from "./api";
export const authService = {
  register: (d) => api.post("/auth/register", d),
  login: (d) => api.post("/auth/login", d),
  me: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
  forgotPassword: (d) => api.post("/auth/forgot-password", d),
  resetPassword: (d) => api.post("/auth/reset-password", d),
};
