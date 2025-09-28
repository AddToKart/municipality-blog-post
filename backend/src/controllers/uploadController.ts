import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { Response } from "express";
import { AuthRequest, ApiResponse } from "@/types";

// Configure multer for image uploads
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Check file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
        )
      );
    }
  },
});

// Configure multer for document uploads
const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit for documents
  },
  fileFilter: (_req, file, cb) => {
    // Check file type for documents
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
      "text/plain", // .txt
      "application/rtf", // .rtf
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, and RTF files are allowed."
        )
      );
    }
  },
});

// Ensure upload directory exists
const ensureUploadDir = async (dir: string): Promise<void> => {
  try {
    await fs.access(dir);
    // Upload directory already exists
  } catch {
    // Creating upload directory
    await fs.mkdir(dir, { recursive: true });
    // Upload directory created
  }
};

// Generate unique filename
const generateFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const ext = path.extname(originalName).toLowerCase();
  return `${timestamp}-${random}${ext}`;
};

// Upload single image
export const uploadImage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  // Image upload request received

  try {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: "Authentication required",
      };
      res.status(401).json(response);
      return;
    }

    if (!req.file) {
      console.log("❌ Upload failed: No file in request");
      const response: ApiResponse = {
        success: false,
        error: "No file uploaded",
      };
      res.status(400).json(response);
      return;
    }

    // Create upload directory
    const uploadDir = path.join(process.cwd(), "uploads", "images");
    console.log("📁 Upload directory path:", uploadDir);
    await ensureUploadDir(uploadDir);

    // Generate filename
    const fileName = generateFileName(req.file.originalname);
    const filePath = path.join(uploadDir, fileName);
    console.log("📄 Generated filename:", fileName);
    console.log("📍 Full file path:", filePath);

    // Process image with sharp (resize and optimize)
    let processedBuffer = req.file.buffer;

    if (req.file.mimetype !== "image/gif") {
      // Don't process GIFs to preserve animation
      processedBuffer = await sharp(req.file.buffer)
        .resize(1200, 1200, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: 85 })
        .toBuffer();
    }

    // Save file
    console.log("💾 Saving file to disk...");
    await fs.writeFile(filePath, processedBuffer);
    console.log("✅ File saved successfully");

    // Generate URL
    const fileUrl = `/uploads/images/${fileName}`;
    console.log("🔗 Generated URL:", fileUrl);

    const response: ApiResponse = {
      success: true,
      data: {
        filename: fileName,
        originalName: req.file.originalname,
        url: fileUrl,
        size: processedBuffer.length,
        mimetype: req.file.mimetype,
      },
      message: "Image uploaded successfully",
    };

    console.log("✅ Upload completed successfully");
    res.json(response);
  } catch (error) {
    // Upload error occurred - details hidden for security

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload image",
    };
    res.status(500).json(response);
  }
};

// Upload multiple images
export const uploadMultipleImages = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: "Authentication required",
      };
      res.status(401).json(response);
      return;
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      const response: ApiResponse = {
        success: false,
        error: "No files uploaded",
      };
      res.status(400).json(response);
      return;
    }

    // Create upload directory
    const uploadDir = path.join(process.cwd(), "uploads", "images");
    await ensureUploadDir(uploadDir);

    const uploadedFiles = [];

    for (const file of files) {
      try {
        // Generate filename
        const fileName = generateFileName(file.originalname);
        const filePath = path.join(uploadDir, fileName);

        // Process image
        let processedBuffer = file.buffer;

        if (file.mimetype !== "image/gif") {
          processedBuffer = await sharp(file.buffer)
            .resize(1200, 1200, {
              fit: "inside",
              withoutEnlargement: true,
            })
            .jpeg({ quality: 85 })
            .toBuffer();
        }

        // Save file
        await fs.writeFile(filePath, processedBuffer);

        uploadedFiles.push({
          filename: fileName,
          originalName: file.originalname,
          url: `/uploads/images/${fileName}`,
          size: processedBuffer.length,
          mimetype: file.mimetype,
        });
      } catch (error) {
        console.error(`Failed to process file ${file.originalname}:`, error);
      }
    }

    const response: ApiResponse = {
      success: true,
      data: uploadedFiles,
      message: `${uploadedFiles.length} images uploaded successfully`,
    };

    res.json(response);
  } catch (error) {
    console.error("Multiple upload error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Failed to upload images",
    };
    res.status(500).json(response);
  }
};

// Delete uploaded image
export const deleteImage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: "Authentication required",
      };
      res.status(401).json(response);
      return;
    }

    const { filename } = req.params;

    if (!filename) {
      const response: ApiResponse = {
        success: false,
        error: "Filename is required",
      };
      res.status(400).json(response);
      return;
    }

    // Security check - ensure filename doesn't contain path traversal
    if (
      filename.includes("..") ||
      filename.includes("/") ||
      filename.includes("\\")
    ) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid filename",
      };
      res.status(400).json(response);
      return;
    }

    const filePath = path.join(process.cwd(), "uploads", "images", filename);

    try {
      await fs.unlink(filePath);
      const response: ApiResponse = {
        success: true,
        message: "Image deleted successfully",
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: "File not found",
      };
      res.status(404).json(response);
    }
  } catch (error) {
    console.error("Delete error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Failed to delete image",
    };
    res.status(500).json(response);
  }
};

// Upload document function
export const uploadDocument = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  // Document upload request received

  try {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: "Authentication required",
      };
      res.status(401).json(response);
      return;
    }

    if (!req.file) {
      console.log("❌ Upload failed: No file in request");
      const response: ApiResponse = {
        success: false,
        error: "No file uploaded",
      };
      res.status(400).json(response);
      return;
    }

    // Create upload directory for documents
    const uploadDir = path.join(process.cwd(), "uploads", "documents");
    console.log("📁 Document upload directory path:", uploadDir);
    await ensureUploadDir(uploadDir);

    // Generate filename and path
    const fileName = generateFileName(req.file.originalname);
    const filePath = path.join(uploadDir, fileName);
    console.log("📄 Generated filename:", fileName);
    console.log("📍 Full file path:", filePath);

    // Save document file (no processing needed for documents)
    console.log("💾 Saving document file to disk...");
    await fs.writeFile(filePath, req.file.buffer);
    console.log("✅ Document file saved successfully");

    // Generate public URL
    const fileUrl = `/uploads/documents/${fileName}`;
    console.log("🔗 Generated URL:", fileUrl);

    const response: ApiResponse = {
      success: true,
      data: {
        filename: fileName,
        originalName: req.file.originalname,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
      message: "Document uploaded successfully",
    };

    console.log("✅ Document upload completed successfully");
    res.json(response);
  } catch (error) {
    console.error("❌ Document upload error details:", error);
    console.error(
      "Error type:",
      error instanceof Error ? error.constructor.name : typeof error
    );
    console.error(
      "Error message:",
      error instanceof Error ? error.message : String(error)
    );

    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to upload document",
    };
    res.status(500).json(response);
  }
};

// Middleware exports
export const singleImageUpload = imageUpload.single("image");
export const multipleImageUpload = imageUpload.array("images", 10); // Max 10 images
export const singleDocumentUpload = documentUpload.single("document");
export const multipleDocumentUpload = documentUpload.array("documents", 5); // Max 5 documents
