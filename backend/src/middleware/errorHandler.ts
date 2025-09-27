import { Request, Response, NextFunction } from "express";
import { ApiResponse, ValidationError } from "@/types";

interface ErrorWithStatus extends Error {
  status?: number;
  statusCode?: number;
  errors?: ValidationError[];
}

export const errorHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Default to 500 server error
  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose validation error
  if (err.name === "ValidationError" && err.errors) {
    statusCode = 400;
    message = "Validation Error";
  }

  // PostgreSQL errors
  if (err.message?.includes("duplicate key value")) {
    statusCode = 409;
    message = "Resource already exists";
  }

  if (err.message?.includes("violates foreign key constraint")) {
    statusCode = 400;
    message = "Invalid reference to related resource";
  }

  if (err.message?.includes("violates not-null constraint")) {
    statusCode = 400;
    message = "Required field is missing";
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Multer errors (file upload)
  if (err.message?.includes("LIMIT_FILE_SIZE")) {
    statusCode = 400;
    message = "File size too large";
  }

  if (err.message?.includes("LIMIT_UNEXPECTED_FILE")) {
    statusCode = 400;
    message = "Unexpected file field";
  }

  const response: ApiResponse = {
    success: false,
    error: message,
  };

  // Add validation details in development
  if (process.env["NODE_ENV"] === "development" && err.errors) {
    response.data = { validationErrors: err.errors };
  }

  // Log error in development
  if (process.env["NODE_ENV"] === "development") {
    console.error("Error:", {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
    });
  }

  res.status(statusCode).json(response);
};
