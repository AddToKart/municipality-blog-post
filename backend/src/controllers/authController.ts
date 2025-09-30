import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { query } from "@/config/database";
import { ProductionLogger } from "@/utils/logger";
import { tokenBlacklist } from "@/utils/tokenBlacklist";
import { failedLoginTracker } from "@/middleware/authRateLimiter";
import {
  AuthRequest,
  LoginRequest,
  JwtPayload,
  ApiResponse,
  UserRow,
} from "@/types";

const logger = new ProductionLogger();

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as LoginRequest;

    // Validate input
    if (!email || !password) {
      const response: ApiResponse = {
        success: false,
        error: "Email and password are required",
      };
      res.status(400).json(response);
      return;
    }

    // Check if IP or email is blocked due to failed attempts
    const clientIp = req.ip || req.socket.remoteAddress || "unknown";
    const identifier = `${email.toLowerCase()}:${clientIp}`;

    if (failedLoginTracker.isBlocked(identifier)) {
      const remainingMinutes =
        failedLoginTracker.getBlockTimeRemaining(identifier);
      const response: ApiResponse = {
        success: false,
        error: `Too many failed login attempts. Please try again in ${remainingMinutes} minutes.`,
      };
      res.status(429).json(response);
      return;
    }

    // Find user by email (using parameterized query to prevent SQL injection)
    const users = await query<UserRow>(
      "SELECT * FROM users WHERE LOWER(email) = LOWER($1)",
      [email]
    );

    if (users.length === 0) {
      // Record failed attempt
      failedLoginTracker.recordFailure(identifier);

      const response: ApiResponse = {
        success: false,
        error: "Invalid credentials",
      };
      res.status(401).json(response);
      return;
    }

    const user = users[0]!; // We already checked length above

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      // Record failed attempt
      failedLoginTracker.recordFailure(identifier);

      const response: ApiResponse = {
        success: false,
        error: "Invalid credentials",
      };
      res.status(401).json(response);
      return;
    }

    // Clear failed attempts on successful login
    failedLoginTracker.recordSuccess(identifier);

    // Generate JWT token
    if (!process.env["JWT_SECRET"]) {
      logger.error("JWT_SECRET not configured");
      throw new Error("JWT_SECRET not configured");
    }

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env["JWT_SECRET"]!, {
      expiresIn: "24h",
    });

    logger.info("User logged in successfully");

    // Return success response with token and user info
    const response: ApiResponse = {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          created_at: user.created_at.toISOString(),
          updated_at: user.updated_at.toISOString(),
        },
      },
      message: "Login successful",
    };

    res.json(response);
  } catch (error) {
    logger.error("Authentication error occurred");
    const response: ApiResponse = {
      success: false,
      error: "Internal server error",
    };
    res.status(500).json(response);
  }
};

export const logout = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);

      // Decode token to get expiration time
      try {
        const decoded = jwt.decode(token) as JwtPayload & { exp: number };

        if (decoded && decoded.exp) {
          // Add token to blacklist with its expiration time
          const expiresAt = decoded.exp * 1000; // Convert to milliseconds
          tokenBlacklist.blacklistToken(token, expiresAt);

          logger.info("User logged out - token blacklisted");
        }
      } catch (decodeError) {
        // If token is invalid, that's okay for logout
        logger.info("Logout attempted with invalid token");
      }
    }

    const response: ApiResponse = {
      success: true,
      message: "Logged out successfully",
    };
    res.json(response);
  } catch (error) {
    logger.error("Logout error occurred");
    const response: ApiResponse = {
      success: false,
      error: "Logout failed",
    };
    res.status(500).json(response);
  }
};

export const getCurrentUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: "Not authenticated",
      };
      res.status(401).json(response);
      return;
    }

    // Fetch fresh user data from database (parameterized query)
    const users = await query<UserRow>(
      "SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = $1",
      [req.user.id]
    );

    if (users.length === 0) {
      logger.error("User not found in database but has valid token");
      const response: ApiResponse = {
        success: false,
        error: "User not found",
      };
      res.status(404).json(response);
      return;
    }

    const user = users[0]!; // We already checked length above

    const response: ApiResponse = {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          created_at: user.created_at.toISOString(),
          updated_at: user.updated_at.toISOString(),
        },
      },
    };

    res.json(response);
  } catch (error) {
    logger.error("User authentication check failed");
    const response: ApiResponse = {
      success: false,
      error: "Internal server error",
    };
    res.status(500).json(response);
  }
};
