import { Router } from "express";
import {
  getAllPosts,
  getPostById,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
} from "@/controllers/postController";
import { authenticate, requireAdmin } from "@/middleware/auth";

const router = Router();

// Public routes
router.get("/", getAllPosts);
router.get("/slug/:slug", getPostBySlug);
router.get("/:id", getPostById);

// Protected routes (admin only)
router.post("/", authenticate, requireAdmin, createPost);
router.put("/:id", authenticate, requireAdmin, updatePost);
router.delete("/:id", authenticate, requireAdmin, deletePost);

export default router;
