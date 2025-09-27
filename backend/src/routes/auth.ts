import express from "express";
import { login, logout, getCurrentUser } from "@/controllers/authController";
import { authenticate } from "@/middleware/auth";

const router = express.Router();

// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/logout
router.post("/logout", logout);

// GET /api/auth/me - Protected route
router.get("/me", authenticate, getCurrentUser);

export default router;
