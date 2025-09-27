import express, { Request, Response } from "express";
import { ApiResponse } from "@/types";

const router = express.Router();

// POST /api/upload - Upload file (admin only)
router.post("/", async (_req: Request, res: Response) => {
  const response: ApiResponse = {
    success: false,
    error: "Upload endpoints not yet implemented",
  };
  res.status(501).json(response);
});

// GET /api/upload - List uploaded files (admin only)
router.get("/", async (_req: Request, res: Response) => {
  const response: ApiResponse = {
    success: false,
    error: "Upload endpoints not yet implemented",
  };
  res.status(501).json(response);
});

// DELETE /api/upload/:id - Delete uploaded file (admin only)
router.delete("/:id", async (_req: Request, res: Response) => {
  const response: ApiResponse = {
    success: false,
    error: "Upload endpoints not yet implemented",
  };
  res.status(501).json(response);
});

export default router;
