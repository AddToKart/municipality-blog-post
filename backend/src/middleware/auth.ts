import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, JwtPayload, ApiResponse } from "@/types";
import { tokenBlacklist } from "@/utils/tokenBlacklist";
import { ProductionLogger } from "@/utils/logger";

const logger = new ProductionLogger();

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
        error: "Invalid or missing authorization header",
      };
      res.status(401).json(response);
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Check if token is blacklisted (logged out)
    if (tokenBlacklist.isBlacklisted(token)) {
      const response: ApiResponse = {
        success: false,
        error: "Token has been invalidated. Please login again.",
      };
      res.status(401).json(response);
      return;
    }

    const jwtSecret = process.env["JWT_SECRET"];

    if (!jwtSecret) {
      logger.error("JWT_SECRET not configured");
      throw new Error("JWT_SECRET not configured");
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

      // Validate token payload
      if (!decoded.id || !decoded.email || !decoded.username) {
        const response: ApiResponse = {
          success: false,
          error: "Invalid token payload",
        };
        res.status(401).json(response);
        return;
      }

      // Set user in request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        username: decoded.username,
        role: decoded.role as "admin",
        password: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      next();
    } catch (jwtError) {
      logger.error("Token verification failed");
      const response: ApiResponse = {
        success: false,
        error: "Invalid or expired token",
      };
      res.status(401).json(response);
      return;
    }
  } catch (error) {
    logger.error("Authentication failed");
    const response: ApiResponse = {
      success: false,
      error: "Authentication failed",
    };
    res.status(500).json(response);
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
