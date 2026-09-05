import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { availability } from "../controllers/watchmode.controller.js";

const router = Router();
router.get("/:type/:tmdbId", asyncHandler(availability));
export default router;
