import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
export function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
}
export function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
}

let transporter;
function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) return null;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });
  return transporter;
}

export async function sendPasswordResetEmail({ email, name, token }) {
  const mailer = getTransporter();
  if (!mailer) {
    console.warn("Password reset email not sent: SMTP is not configured");
    return;
  }
  const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${encodeURIComponent(token)}`;
  await mailer.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: "Reset your CineVo password",
    text: `Hi ${name || "there"}, reset your CineVo password here: ${resetUrl}. This link expires in 1 hour.`,
    html: `<p>Hi ${name || "there"},</p><p>Reset your CineVo password using the link below. It expires in 1 hour.</p><p><a href="${resetUrl}">Reset password</a></p>`,
  });
}
