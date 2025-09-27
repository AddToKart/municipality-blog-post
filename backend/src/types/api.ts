import { Request } from "express";
import { User } from "./database";

// Extend Express Request type to include user
export interface AuthRequest extends Request {
  user?: User;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Request body types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  excerpt?: string;
  category: "post" | "announcement";
  status?: "draft" | "published";
  featured_image?: string;
  tags?: string[];
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {
  id: number;
}

export interface CreateCommentRequest {
  author_name: string;
  author_email: string;
  content: string;
}

export interface UpdateCommentRequest {
  status: "approved" | "rejected";
}

export interface CreateReactionRequest {
  reaction_type: "like" | "love" | "helpful";
}

// Query parameter types
export interface PostQueryParams {
  page?: string;
  limit?: string;
  category?: "post" | "announcement";
  status?: "draft" | "published";
  search?: string;
  tags?: string;
  author_id?: string;
}

export interface CommentQueryParams {
  page?: string;
  limit?: string;
  status?: "pending" | "approved" | "rejected";
  post_id?: string;
}

// JWT Payload type
export interface JwtPayload {
  id: number;
  email: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

// File upload types
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface DatabaseError {
  code: string;
  detail?: string;
  constraint?: string;
}

// Environment variables type
export interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  FRONTEND_URL: string;
  UPLOAD_PATH: string;
  MAX_FILE_SIZE: number;
  DEFAULT_ADMIN_USERNAME: string;
  DEFAULT_ADMIN_EMAIL: string;
  DEFAULT_ADMIN_PASSWORD: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  AUTH_RATE_LIMIT_MAX_REQUESTS: number;
}
