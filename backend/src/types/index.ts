export * from "./database";
export * from "./api";

// Post-related types
export interface CreatePostRequest {
  title: string;
  content: string;
  excerpt?: string;
  category: "post" | "announcement";
  status?: "draft" | "published";
  featured_image?: string;
  tags?: string[];
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  excerpt?: string;
  category?: "post" | "announcement";
  status?: "draft" | "published";
  featured_image?: string;
  tags?: string[];
}

export interface PostQueryParams {
  page?: string;
  limit?: string;
  category?: string;
  status?: string;
  search?: string;
  tags?: string;
  author_id?: string;
}
