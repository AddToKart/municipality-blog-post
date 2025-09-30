import express from "express";
import { login, logout, getCurrentUser } from "@/controllers/authController";
import { authenticate } from "@/middleware/auth";
import {
  loginRateLimiter,
  authRateLimiter,
} from "@/middleware/authRateLimiter";
import { validateLoginRequest } from "@/utils/validation";

const router = express.Router();

// POST /api/auth/login - Apply strict rate limiting and validation
router.post("/login", loginRateLimiter, validateLoginRequest, login);

// POST /api/auth/logout - Apply moderate rate limiting
router.post("/logout", authRateLimiter, logout);

// GET /api/auth/me - Protected route with moderate rate limiting
router.get("/me", authRateLimiter, authenticate, getCurrentUser);

export default router;
