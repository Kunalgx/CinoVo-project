import { Router } from "express";
import multer from "multer";
import path from "path";
import {
  profile,
  updateProfile,
  avatar,
  updateAvatarUrl,
} from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { profileSchema, avatarSchema } from "../validators/user.validator.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) =>
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    cb(null, /^image\/(jpeg|png|webp)$/.test(file.mimetype)),
});
const r = Router();
r.use(requireAuth);
r.get("/profile", asyncHandler(profile));
r.patch("/profile", validate(profileSchema), asyncHandler(updateProfile));
r.post("/avatar", upload.single("avatar"), asyncHandler(avatar));
r.patch("/profile/avatar", validate(avatarSchema), asyncHandler(updateAvatarUrl));
export default r;
