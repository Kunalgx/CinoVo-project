import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Details from "./pages/Details";
import Timeline from "./pages/Timeline";
import Watchlist from "./pages/Watchlist";
import RandomPicker from "./pages/RandomPicker";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import MobileBottomNav from "./components/MobileBottomNav";
export default function App() {
  return (
    <>
      <Navbar />
      <div className="pb-20 md:pb-0">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search" element={<Search />} />
        <Route path="/movie/:id" element={<Details type="movie" />} />
        <Route path="/tv/:id" element={<Details type="tv" />} />
        <Route path="/random" element={<RandomPicker />} />
        <Route
          path="/timeline"
          element={
            <ProtectedRoute>
              <Timeline />
            </ProtectedRoute>
          }
        />
        <Route
          path="/watchlist"
          element={
            <ProtectedRoute>
              <Watchlist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
      </div>
      <MobileBottomNav />
    </>
  );
}
