import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
export function requireAuth(req, res, next) {
  try {
    const token =
      req.cookies?.cinevo_token ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.slice(7)
        : null);
    if (!token) throw new ApiError(401, "Authentication required");
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    next(
      e instanceof ApiError
        ? e
        : new ApiError(401, "Invalid or expired session"),
    );
  }
}
