import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { auth } from "../controllers/imagekit.controller.js";

const router = Router();
router.get("/auth", requireAuth, asyncHandler(auth));
export default router;