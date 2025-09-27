// Shared types that match frontend types exactly
export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: "post" | "announcement";
  status: "draft" | "published";
  featured_image?: string;
  tags: string[];
  author_id: number;
  like_count: number;
  love_count: number;
  helpful_count: number;
  view_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  published_at: string;
  author_name?: string;
}

export interface Comment {
  id: number;
  post_id: number;
  author_name: string;
  author_email: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface Reaction {
  id: number;
  post_id: number;
  reaction_type: "like" | "love" | "helpful";
  ip_address: string;
  created_at: string;
}

export interface ReactionCounts {
  like: number;
  love: number;
  helpful: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: "admin";
  created_at: string;
  updated_at: string;
}

export interface Media {
  id: number;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: number;
  created_at: string;
}

// Database row types (what comes from PostgreSQL)
export interface PostRow {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  status: string;
  featured_image: string | null;
  tags: string[];
  author_id: number;
  like_count: number;
  love_count: number;
  helpful_count: number;
  view_count: number;
  created_at: Date;
  updated_at: Date;
  published_at: Date | null;
}

export interface CommentRow {
  id: number;
  post_id: number;
  author_name: string;
  author_email: string;
  content: string;
  status: string;
  created_at: Date;
}

export interface ReactionRow {
  id: number;
  post_id: number;
  reaction_type: string;
  ip_address: string;
  user_agent: string | null;
  created_at: Date;
}

export interface UserRow {
  id: number;
  username: string;
  email: string;
  password: string;
  role: string;
  created_at: Date;
  updated_at: Date;
}

export interface MediaRow {
  id: number;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: number | null;
  created_at: Date;
}
