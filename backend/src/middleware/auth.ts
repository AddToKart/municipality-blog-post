import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, JwtPayload, ApiResponse } from "@/types";

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log("\n=== 🔐 AUTHENTICATION DEBUG ===");
  console.log("Request method:", req.method);
  console.log("Request URL:", req.url);
  console.log(
    "Request headers authorization:",
    req.headers.authorization ? "Present" : "Missing"
  );

  // Log all headers for debugging
  console.log("All request headers:");
  Object.entries(req.headers).forEach(([key, value]) => {
    if (
      key.toLowerCase().includes("auth") ||
      key.toLowerCase().includes("bearer")
    ) {
      console.log(`  ${key}: ${value}`);
    }
  });

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log("❌ Auth failed: No authorization header");
      const response: ApiResponse = {
        success: false,
        error: "No authorization header provided",
      };
      res.status(401).json(response);
      return;
    }

    console.log("Raw authorization header:", authHeader);

    if (!authHeader.startsWith("Bearer ")) {
      console.log(
        "❌ Auth failed: Authorization header doesn't start with 'Bearer '"
      );
      console.log("Header value:", authHeader);
      const response: ApiResponse = {
        success: false,
        error: "Invalid authorization header format. Must start with 'Bearer '",
      };
      res.status(401).json(response);
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log(
      "🎫 Extracted token (first 30 chars):",
      token.substring(0, 30) + "..."
    );
    console.log("🎫 Token length:", token.length);

    // Check JWT_SECRET
    const jwtSecret = process.env["JWT_SECRET"];
    console.log("JWT_SECRET configured:", !!jwtSecret);
    console.log("JWT_SECRET length:", jwtSecret ? jwtSecret.length : 0);

    if (!jwtSecret) {
      console.log("❌ JWT_SECRET not configured in environment");
      throw new Error("JWT_SECRET not configured");
    }

    console.log("🔓 Verifying token with JWT_SECRET...");

    try {
      const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
      console.log("✅ Token verification successful!");
      console.log("Decoded payload:", {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role,
        iat: decoded.iat
          ? new Date(decoded.iat * 1000).toISOString()
          : undefined,
        exp: decoded.exp
          ? new Date(decoded.exp * 1000).toISOString()
          : undefined,
      });

      // Set user in request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        username: decoded.username,
        role: decoded.role as "admin",
        password: "", // Don't include password in auth
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log(
        "✅ Authentication successful, proceeding to next middleware"
      );
      console.log("=== END AUTHENTICATION DEBUG ===\n");
      next();
    } catch (jwtError) {
      console.log("❌ JWT verification error:", jwtError);
      if (jwtError instanceof jwt.TokenExpiredError) {
        console.log("Token expired at:", jwtError.expiredAt);
      } else if (jwtError instanceof jwt.JsonWebTokenError) {
        console.log("JWT error:", jwtError.message);
      } else if (jwtError instanceof jwt.NotBeforeError) {
        console.log("Token not active yet:", jwtError.date);
      }

      const response: ApiResponse = {
        success: false,
        error: "Invalid or expired token",
      };
      res.status(401).json(response);
      return;
    }
  } catch (error) {
    console.log("❌ General authentication error:", error);
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
