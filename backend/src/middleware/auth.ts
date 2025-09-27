import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, JwtPayload, ApiResponse } from "@/types";

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const response: ApiResponse = {
        success: false,
        error: "No token provided or invalid format",
      };
      res.status(401).json(response);
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!process.env["JWT_SECRET"]) {
      throw new Error("JWT_SECRET not configured");
    }

    const decoded = jwt.verify(token, process.env["JWT_SECRET"]) as JwtPayload;

    // You would normally fetch the full user from database here
    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
      role: decoded.role as "admin",
      password: "", // Don't include password in auth
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    next();
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: "Invalid or expired token",
    };
    res.status(401).json(response);
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== "admin") {
    const response: ApiResponse = {
      success: false,
      error: "Admin access required",
    };
    res.status(403).json(response);
    return;
  }

  next();
};
