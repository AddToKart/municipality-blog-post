/**
 * Authentication Rate Limiter
 *
 * Protects authentication endpoints from brute force attacks
 */

import rateLimit from "express-rate-limit";
import { Request, Response } from "express";
import { ApiResponse } from "@/types";

/**
 * Strict rate limiter for login attempts
 * Allows 5 attempts per 15 minutes per IP
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: "Too many login attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (_req: Request, res: Response) => {
    const response: ApiResponse = {
      success: false,
      error: "Too many login attempts. Please try again in 15 minutes.",
    };
    res.status(429).json(response);
  },
  // Track by IP address
  keyGenerator: (req: Request) => {
    return req.ip || req.socket.remoteAddress || "unknown";
  },
});

/**
 * Moderate rate limiter for authenticated requests
 * Allows 100 requests per 15 minutes per IP
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: "Too many requests, please slow down",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    const response: ApiResponse = {
      success: false,
      error: "Too many requests. Please try again later.",
    };
    res.status(429).json(response);
  },
  keyGenerator: (req: Request) => {
    return req.ip || req.socket.remoteAddress || "unknown";
  },
});

/**
 * Very strict rate limiter for failed login attempts
 * Uses a sliding window to track failed attempts
 */
class FailedLoginTracker {
  private attempts: Map<
    string,
    { count: number; firstAttempt: number; blocked: boolean }
  > = new Map();
  private readonly MAX_ATTEMPTS = 3;
  private readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  private readonly BLOCK_DURATION_MS = 60 * 60 * 1000; // 1 hour

  /**
   * Record a failed login attempt
   * @param identifier - Email or IP address
   * @returns true if should be blocked
   */
  recordFailure(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record) {
      this.attempts.set(identifier, {
        count: 1,
        firstAttempt: now,
        blocked: false,
      });
      return false;
    }

    // Check if still within window
    const timeElapsed = now - record.firstAttempt;

    if (record.blocked) {
      // Check if block has expired
      if (timeElapsed > this.BLOCK_DURATION_MS) {
        this.attempts.delete(identifier);
        return false;
      }
      return true;
    }

    // Reset if window expired
    if (timeElapsed > this.WINDOW_MS) {
      this.attempts.set(identifier, {
        count: 1,
        firstAttempt: now,
        blocked: false,
      });
      return false;
    }

    // Increment count
    record.count++;

    // Block if exceeded max attempts
    if (record.count >= this.MAX_ATTEMPTS) {
      record.blocked = true;
      record.firstAttempt = now; // Reset timer for block duration
      return true;
    }

    return false;
  }

  /**
   * Record a successful login (clears failed attempts)
   */
  recordSuccess(identifier: string): void {
    this.attempts.delete(identifier);
  }

  /**
   * Check if identifier is currently blocked
   */
  isBlocked(identifier: string): boolean {
    const record = this.attempts.get(identifier);

    if (!record || !record.blocked) {
      return false;
    }

    const now = Date.now();
    const timeElapsed = now - record.firstAttempt;

    // Unblock if duration expired
    if (timeElapsed > this.BLOCK_DURATION_MS) {
      this.attempts.delete(identifier);
      return false;
    }

    return true;
  }

  /**
   * Get remaining block time in minutes
   */
  getBlockTimeRemaining(identifier: string): number {
    const record = this.attempts.get(identifier);

    if (!record || !record.blocked) {
      return 0;
    }

    const now = Date.now();
    const timeElapsed = now - record.firstAttempt;
    const remaining = this.BLOCK_DURATION_MS - timeElapsed;

    return Math.ceil(remaining / (60 * 1000));
  }

  /**
   * Clear all records (mainly for testing)
   */
  clear(): void {
    this.attempts.clear();
  }
}

// Singleton instance
export const failedLoginTracker = new FailedLoginTracker();
