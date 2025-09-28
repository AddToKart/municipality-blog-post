import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { query } from "@/config/database";
import { ProductionLogger } from "@/utils/logger";
import {
  AuthRequest,
  LoginRequest,
  JwtPayload,
  ApiResponse,
  UserRow,
} from "@/types";

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

    // Find user by email
    const users = await query<UserRow>("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (users.length === 0) {
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
      const response: ApiResponse = {
        success: false,
        error: "Invalid credentials",
      };
      res.status(401).json(response);
      return;
    }

    // Generate JWT token
    if (!process.env["JWT_SECRET"]) {
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
    const logger = new ProductionLogger();
    logger.error("Authentication error occurred");
    const response: ApiResponse = {
      success: false,
      error: "Internal server error",
    };
    res.status(500).json(response);
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  // For JWT, logout is handled client-side by removing the token
  const response: ApiResponse = {
    success: true,
    message: "Logged out successfully",
  };
  res.json(response);
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

    // Fetch fresh user data from database
    const users = await query<UserRow>(
      "SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = $1",
      [req.user.id]
    );

    if (users.length === 0) {
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
    const logger = new ProductionLogger();
    logger.error("User authentication check failed");
    const response: ApiResponse = {
      success: false,
      error: "Internal server error",
    };
    res.status(500).json(response);
  }
};
