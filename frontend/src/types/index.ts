export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: 'post' | 'announcement';
  status: 'draft' | 'published';
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
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Reaction {
  id: number;
  post_id: number;
  reaction_type: 'like' | 'love' | 'helpful';
  ip_address: string;
  created_at: string;
}

export interface ReactionCounts {
  like: number;
  love: number;
  helpful: number;
}