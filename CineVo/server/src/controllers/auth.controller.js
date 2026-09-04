import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { signToken, cookieOptions, sendPasswordResetEmail } from "../services/auth.service.js";
const safe = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  avatar: u.avatar,
  role: u.role,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
});
export async function register(req, res) {
  const { name, email, password } = req.body;
  if (await User.findOne({ email }))
    throw new ApiError(409, "Email is already registered");
  const hash = await bcrypt.hash(password, 12);
  const u = await User.create({ name, email, password: hash });
  const token = signToken(u);
  res
    .cookie("cinevo_token", token, cookieOptions())
    .status(201)
    .json({ success: true, user: safe(u) });
}
export async function login(req, res) {
  const { email, password } = req.body;
  const u = await User.findOne({ email }).select("+password");
  if (!u || !(await bcrypt.compare(password, u.password)))
    throw new ApiError(401, "Invalid email or password");
  const token = signToken(u);
  res
    .cookie("cinevo_token", token, cookieOptions())
    .json({ success: true, user: safe(u) });
}
export async function me(req, res) {
  const u = await User.findById(req.user.id);
  if (!u) throw new ApiError(401, "User no longer exists");
  res.json({ success: true, user: safe(u) });
}
export function logout(req, res) {
  res
    .clearCookie("cinevo_token", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    })
    .json({ success: true, message: "Logged out" });
}

export async function forgotPassword(req, res) {
  const email = req.body.email.trim().toLowerCase();
  const user = await User.findOne({ email }).select("+resetPasswordToken +resetPasswordExpires");
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });
    try {
      await sendPasswordResetEmail({ email: user.email, name: user.name, token });
    } catch (error) {
      console.error("Password reset email failed", error.message);
    }
  }
  res.json({ success: true, message: "If an account exists for that email, reset instructions have been sent." });
}

export async function resetPassword(req, res) {
  const hashedToken = crypto.createHash("sha256").update(req.body.token).digest("hex");
  const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpires: { $gt: new Date() } }).select("+password +resetPasswordToken +resetPasswordExpires");
  if (!user) throw new ApiError(400, "This reset link is invalid or has expired");
  user.password = await bcrypt.hash(req.body.password, 12);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  res.json({ success: true, message: "Password reset successfully" });
}
