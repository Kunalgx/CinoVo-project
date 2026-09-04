import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from "./Loading";
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth(),
    loc = useLocation();
  if (loading) return <Loading />;
  return user ? (
    children
  ) : (
    <Navigate to="/login" replace state={{ from: loc.pathname }} />
  );
}
