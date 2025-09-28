import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import dotenv from "dotenv";

// Import routes
import authRoutes from "@/routes/auth";
import postRoutes from "@/routes/posts";
import commentRoutes from "@/routes/comments";
import reactionRoutes from "@/routes/reactions";
import uploadRoutes from "@/routes/upload";

// Import middleware
import { errorHandler } from "@/middleware/errorHandler";
import { notFound } from "@/middleware/notFound";
import { ApiResponse } from "@/types";

// Load environment variables
dotenv.config();

const app: Application = express();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
      },
    },
  })
);

// CORS configuration
const corsOptions = {
  origin: process.env["FRONTEND_URL"] || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// Rate limiting - Production-friendly limits
const limiter = rateLimit({
  windowMs: parseInt(process.env["RATE_LIMIT_WINDOW_MS"] || "900000"), // 15 minutes
  max: parseInt(process.env["RATE_LIMIT_MAX_REQUESTS"] || "300"), // Increased from 100 to 300
  message: {
    error: "Too many requests from this IP, please try again later.",
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// Rate limiting for auth endpoints - more reasonable for production
const authLimiter = rateLimit({
  windowMs: parseInt(process.env["RATE_LIMIT_WINDOW_MS"] || "900000"), // 15 minutes
  max: parseInt(process.env["AUTH_RATE_LIMIT_MAX_REQUESTS"] || "20"), // Increased from 5 to 20
  message: {
    error: "Too many authentication attempts, please try again later.",
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for successful token validation on /me endpoint
  skip: (req) => {
    return req.path === "/me" && req.method === "GET";
  },
});

// Apply stricter rate limiting only to login endpoint
app.use("/api/auth/login", authLimiter);

// Lighter rate limiting for other auth endpoints
const authLightLimiter = rateLimit({
  windowMs: parseInt(process.env["RATE_LIMIT_WINDOW_MS"] || "900000"),
  max: parseInt(process.env["AUTH_RATE_LIMIT_MAX_REQUESTS"] || "100"), // Much higher for /me endpoint
  message: {
    error: "Too many requests, please try again later.",
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth/", authLightLimiter);

// Body parsing middleware with error handling
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// JSON parsing error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  if (err instanceof SyntaxError && "body" in err) {
    const response: ApiResponse = {
      success: false,
      error: "Invalid JSON format in request body",
    };
    res.status(400).json(response);
    return;
  }
  next(err);
});

// Logging middleware
if (process.env["NODE_ENV"] !== "production") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Static files for uploads
const uploadPath = process.env["UPLOAD_PATH"] || "./uploads";
app.use("/uploads", express.static(path.resolve(uploadPath)));

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env["NODE_ENV"] || "development",
      version: "1.0.0",
    },
  };
  res.json(response);
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/reactions", reactionRoutes);
app.use("/api/upload", uploadRoutes);

// API documentation endpoint
app.get("/api", (_req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      message: "Santa Maria Municipality Blog API",
      version: "1.0.0",
      endpoints: {
        auth: "/api/auth",
        posts: "/api/posts",
        comments: "/api/comments",
        reactions: "/api/reactions",
        upload: "/api/upload",
        health: "/api/health",
      },
      documentation: "See README.md for detailed API documentation",
    },
  };
  res.json(response);
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

export default app;
