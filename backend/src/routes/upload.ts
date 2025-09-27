import express from "express";
import {
  uploadImage,
  uploadMultipleImages,
  uploadDocument,
  deleteImage,
  singleImageUpload,
  multipleImageUpload,
  singleDocumentUpload,
  multipleDocumentUpload,
} from "@/controllers/uploadController";
import { authenticate, requireAdmin } from "@/middleware/auth";

const router = express.Router();

// Image upload routes
router.post(
  "/image",
  authenticate,
  requireAdmin,
  singleImageUpload,
  uploadImage
);
router.post(
  "/images",
  authenticate,
  requireAdmin,
  multipleImageUpload,
  uploadMultipleImages
);

// Document upload routes
router.post(
  "/document",
  authenticate,
  requireAdmin,
  singleDocumentUpload,
  uploadDocument
);

// Delete routes (works for both images and documents)
router.delete("/image/:filename", authenticate, requireAdmin, deleteImage);
router.delete("/document/:filename", authenticate, requireAdmin, deleteImage);

export default router;
