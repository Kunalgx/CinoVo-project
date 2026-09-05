import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Watchlist from "../models/Watchlist.js";
import WatchHistory from "../models/WatchHistory.js";
import { ApiError } from "../utils/ApiError.js";
import { isImageKitUrl } from "../services/imagekit.service.js";
export async function profile(req, res) {
  const [u, watched, scheduled] = await Promise.all([
    User.findById(req.user.id),
    WatchHistory.countDocuments({ user: req.user.id }),
    Watchlist.countDocuments({ user: req.user.id }),
  ]);
  res.json({
    success: true,
    user: {
      id: u._id,
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      role: u.role,
      createdAt: u.createdAt,
      watchedCount: watched,
      scheduledCount: scheduled,
    },
  });
}
export async function updateProfile(req, res) {
  const u = await User.findById(req.user.id).select("+password");
  if (req.body.name) u.name = req.body.name.trim();
  if (req.body.password) {
    if (!req.body.currentPassword)
      throw new ApiError(400, "Current password is required");
    if (!(await bcrypt.compare(req.body.currentPassword, u.password)))
      throw new ApiError(400, "Current password is incorrect");
    u.password = await bcrypt.hash(req.body.password, 12);
  }
  await u.save();
  res.json({ success: true, message: "Profile updated" });
}
export async function avatar(req, res) {
  if (!req.file) throw new ApiError(400, "Avatar file is required");
  const u = await User.findByIdAndUpdate(
    req.user.id,
    { avatar: `/uploads/${req.file.filename}` },
    { new: true },
  );
  res.json({ success: true, avatar: u.avatar });
}

export async function updateAvatarUrl(req, res) {
  const avatar = req.body.avatar || "";
  if (avatar && !isImageKitUrl(avatar)) throw new ApiError(400, "Invalid ImageKit avatar URL");
  const u = await User.findByIdAndUpdate(req.user.id, { avatar }, { new: true });
  if (!u) throw new ApiError(404, "User not found");
  res.json({
    success: true,
    user: {
      id: u._id,
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      role: u.role,
      createdAt: u.createdAt,
    },
  });
}
