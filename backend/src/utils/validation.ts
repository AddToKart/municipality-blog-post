/**
 * Input Validation Utilities
 *
 * Provides validation functions to prevent SQL injection, XSS, and other attacks
 */

import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "@/types";

/**
 * Email validation regex (RFC 5322 simplified)
 */
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * SQL injection detection patterns
 */
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|SCRIPT|UNION)\b)/gi,
  /(--|\||;|'|"|\/\*|\*\/)/g,
  /(\bOR\b.*=.*)/gi,
  /(\bAND\b.*=.*)/gi,
];

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") {
    return false;
  }

  return EMAIL_REGEX.test(email.trim()) && email.length <= 254;
}

/**
 * Validate password strength
 * - At least 8 characters
 * - Contains at least one letter and one number
 */
export function isValidPassword(password: string): boolean {
  if (!password || typeof password !== "string") {
    return false;
  }

  if (password.length < 8 || password.length > 128) {
    return false;
  }

  // Must contain at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return hasLetter && hasNumber;
}

/**
 * Sanitize string input to prevent SQL injection
 * Note: This is a secondary defense. Always use parameterized queries!
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  // Remove any SQL keywords and dangerous characters
  let sanitized = input.trim();

  // Limit length to prevent buffer overflow attacks
  if (sanitized.length > 1000) {
    sanitized = sanitized.substring(0, 1000);
  }

  return sanitized;
}

/**
 * Check if string contains potential SQL injection patterns
 */
export function containsSQLInjection(input: string): boolean {
  if (!input || typeof input !== "string") {
    return false;
  }

  return SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Validate and sanitize integer input
 */
export function sanitizeInteger(input: any): number | null {
  const parsed = parseInt(input);

  if (isNaN(parsed) || !isFinite(parsed)) {
    return null;
  }

  return parsed;
}

/**
 * Validate and sanitize positive integer
 */
export function sanitizePositiveInteger(input: any): number | null {
  const parsed = sanitizeInteger(input);

  if (parsed === null || parsed < 0) {
    return null;
  }

  return parsed;
}

/**
 * Validate string length
 */
export function isValidLength(str: string, min: number, max: number): boolean {
  if (!str || typeof str !== "string") {
    return false;
  }

  const length = str.trim().length;
  return length >= min && length <= max;
}

/**
 * Middleware: Validate login request
 */
export function validateLoginRequest(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { email, password } = req.body;

  // Check if fields exist
  if (!email || !password) {
    const response: ApiResponse = {
      success: false,
      error: "Email and password are required",
    };
    res.status(400).json(response);
    return;
  }

  // Validate email format
  if (!isValidEmail(email)) {
    const response: ApiResponse = {
      success: false,
      error: "Invalid email format",
    };
    res.status(400).json(response);
    return;
  }

  // Check password length (don't validate strength on login)
  if (!password || password.length < 1 || password.length > 128) {
    const response: ApiResponse = {
      success: false,
      error: "Invalid password",
    };
    res.status(400).json(response);
    return;
  }

  // Check for SQL injection attempts
  if (containsSQLInjection(email)) {
    const response: ApiResponse = {
      success: false,
      error: "Invalid input detected",
    };
    res.status(400).json(response);
    return;
  }

  next();
}

/**
 * Middleware: Validate pagination parameters
 */
export function validatePaginationParams(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { page, limit } = req.query;

  if (page !== undefined) {
    const pageNum = sanitizePositiveInteger(page);
    if (pageNum === null || pageNum < 1) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid page number",
      };
      res.status(400).json(response);
      return;
    }
  }

  if (limit !== undefined) {
    const limitNum = sanitizePositiveInteger(limit);
    if (limitNum === null || limitNum < 1 || limitNum > 100) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid limit (must be between 1 and 100)",
      };
      res.status(400).json(response);
      return;
    }
  }

  next();
}

/**
 * Middleware: Validate ID parameter
 */
export function validateIdParam(paramName: string = "id") {
  return (req: Request, res: Response, next: NextFunction): void => {
    const id = req.params[paramName];

    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: `${paramName} is required`,
      };
      res.status(400).json(response);
      return;
    }

    const idNum = sanitizePositiveInteger(id);
    if (idNum === null) {
      const response: ApiResponse = {
        success: false,
        error: `Invalid ${paramName}`,
      };
      res.status(400).json(response);
      return;
    }

    next();
  };
}

/**
 * Sanitize object values to prevent XSS
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = {} as T;

  for (const key in obj) {
    const value = obj[key];

    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value) as T[Extract<keyof T, string>];
    } else if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value)
    ) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
