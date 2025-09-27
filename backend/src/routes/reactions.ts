import express, { Request, Response } from "express";
import { ApiResponse } from "@/types";

const router = express.Router();

// GET /api/reactions/:postId - Get post reactions
router.get("/:postId", async (_req: Request, res: Response) => {
  const response: ApiResponse = {
    success: false,
    error: "Reactions endpoints not yet implemented",
  };
  res.status(501).json(response);
});

// POST /api/reactions/:postId - Add/update reaction to post
router.post("/:postId", async (_req: Request, res: Response) => {
  const response: ApiResponse = {
    success: false,
    error: "Reactions endpoints not yet implemented",
  };
  res.status(501).json(response);
});

// DELETE /api/reactions/:postId/:reactionType - Remove reaction from post
router.delete(
  "/:postId/:reactionType",
  async (_req: Request, res: Response) => {
    const response: ApiResponse = {
      success: false,
      error: "Reactions endpoints not yet implemented",
    };
    res.status(501).json(response);
  }
);

export default router;
