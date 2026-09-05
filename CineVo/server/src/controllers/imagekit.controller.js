import { ApiError } from "../utils/ApiError.js";
import { imageKitConfig } from "../services/imagekit.service.js";

export function auth(req, res) {
  const config = imageKitConfig();
  if (!config) throw new ApiError(503, "ImageKit is not configured");
  res.json({ success: true, data: config });
}