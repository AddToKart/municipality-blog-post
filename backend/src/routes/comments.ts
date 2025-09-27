import express, { Request, Response } from "express";
import { ApiResponse } from "@/types";

const router = express.Router();

// GET /api/comments/:postId - Get post comments
router.get("/:postId", async (_req: Request, res: Response) => {
  const response: ApiResponse = {
    success: false,
    error: "Comments endpoints not yet implemented",
  };
  res.status(501).json(response);
});

// POST /api/comments/:postId - Add comment to post
router.post("/:postId", async (_req: Request, res: Response) => {
  const response: ApiResponse = {
    success: false,
    error: "Comments endpoints not yet implemented",
  };
  res.status(501).json(response);
});

// DELETE /api/comments/:id - Delete comment (admin only)
router.delete("/:id", async (_req: Request, res: Response) => {
  const response: ApiResponse = {
    success: false,
    error: "Comments endpoints not yet implemented",
  };
  res.status(501).json(response);
});

// PUT /api/comments/:id/status - Update comment status (admin only)
router.put("/:id/status", async (_req: Request, res: Response) => {
  const response: ApiResponse = {
    success: false,
    error: "Comments endpoints not yet implemented",
  };
  res.status(501).json(response);
});

export default router;
