import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";
const C = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    authService
      .me()
      .then((r) => setUser(r.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
    const f = () => setUser(null);
    window.addEventListener("cinevo:unauthorized", f);
    return () => window.removeEventListener("cinevo:unauthorized", f);
  }, []);
  const logout = async () => {
    await authService.logout().catch(() => {});
    setUser(null);
  };
  return (
    <C.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </C.Provider>
  );
}
export const useAuth = () => useContext(C);
