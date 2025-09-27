import { Request, Response } from "express";
import slugify from "slugify";
import { query } from "@/config/database";
import {
  AuthRequest,
  CreatePostRequest,
  UpdatePostRequest,
  PostQueryParams,
  ApiResponse,
  PaginatedResponse,
  PostRow,
} from "@/types";

export const getAllPosts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      page = "1",
      limit = "10",
      category,
      status = "published",
      search,
      tags,
      author_id,
    } = req.query as PostQueryParams;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build dynamic query
    let whereConditions: string[] = [];
    let queryParams: any[] = [];
    let paramCount = 0;

    // Always filter by status for public endpoints (can be overridden for admin)
    if (status) {
      whereConditions.push(`status = $${++paramCount}`);
      queryParams.push(status);
    }

    if (category) {
      whereConditions.push(`category = $${++paramCount}`);
      queryParams.push(category);
    }

    if (author_id) {
      whereConditions.push(`author_id = $${++paramCount}`);
      queryParams.push(parseInt(author_id));
    }

    if (search) {
      whereConditions.push(
        `(title ILIKE $${++paramCount} OR content ILIKE $${++paramCount} OR excerpt ILIKE $${++paramCount})`
      );
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (tags) {
      whereConditions.push(`tags && $${++paramCount}`);
      queryParams.push([tags]);
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      ${whereClause}
    `;
    const countResult = await query<{ total: string }>(countQuery, queryParams);
    const total = parseInt(countResult[0]?.total || "0");

    // Get posts with pagination
    const postsQuery = `
      SELECT 
        p.*,
        u.username as author_name,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.status = 'approved') as comment_count
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      ${whereClause}
      ORDER BY p.published_at DESC, p.created_at DESC
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;
    queryParams.push(parseInt(limit), offset);

    const posts = await query<
      PostRow & { author_name: string; comment_count: string }
    >(postsQuery, queryParams);

    // Transform to API format
    const transformedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      category: post.category as "post" | "announcement",
      status: post.status as "draft" | "published",
      featured_image: post.featured_image,
      tags: post.tags || [],
      author_id: post.author_id,
      author_name: post.author_name,
      like_count: post.like_count,
      love_count: post.love_count,
      helpful_count: post.helpful_count,
      view_count: post.view_count,
      comment_count: parseInt(post.comment_count || "0"),
      created_at: post.created_at.toISOString(),
      updated_at: post.updated_at.toISOString(),
      published_at: post.published_at?.toISOString() || "",
    }));

    const totalPages = Math.ceil(total / parseInt(limit));

    const response: PaginatedResponse<(typeof transformedPosts)[0]> = {
      success: true,
      data: transformedPosts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Get posts error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Failed to fetch posts",
    };
    res.status(500).json(response);
  }
};

export const getPostById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid post ID",
      };
      res.status(400).json(response);
      return;
    }

    const postQuery = `
      SELECT 
        p.*,
        u.username as author_name,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.status = 'approved') as comment_count
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.id = $1
    `;

    const posts = await query<
      PostRow & { author_name: string; comment_count: string }
    >(postQuery, [parseInt(id)]);

    if (posts.length === 0) {
      const response: ApiResponse = {
        success: false,
        error: "Post not found",
      };
      res.status(404).json(response);
      return;
    }

    const post = posts[0]!;

    // Increment view count
    await query("UPDATE posts SET view_count = view_count + 1 WHERE id = $1", [
      post.id,
    ]);

    // Transform to API format
    const transformedPost = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      category: post.category as "post" | "announcement",
      status: post.status as "draft" | "published",
      featured_image: post.featured_image,
      tags: post.tags || [],
      author_id: post.author_id,
      author_name: post.author_name,
      like_count: post.like_count,
      love_count: post.love_count,
      helpful_count: post.helpful_count,
      view_count: post.view_count + 1, // Include the increment
      comment_count: parseInt(post.comment_count || "0"),
      created_at: post.created_at.toISOString(),
      updated_at: post.updated_at.toISOString(),
      published_at: post.published_at?.toISOString() || "",
    };

    const response: ApiResponse = {
      success: true,
      data: transformedPost,
    };

    res.json(response);
  } catch (error) {
    console.error("Get post error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Failed to fetch post",
    };
    res.status(500).json(response);
  }
};

export const createPost = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: "Authentication required",
      };
      res.status(401).json(response);
      return;
    }

    const {
      title,
      content,
      excerpt,
      category,
      status = "draft",
      featured_image,
      tags = [],
    } = req.body as CreatePostRequest;

    // Validate required fields
    if (!title || !content || !category) {
      const response: ApiResponse = {
        success: false,
        error: "Title, content, and category are required",
      };
      res.status(400).json(response);
      return;
    }

    // Generate slug
    const baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    // Ensure unique slug
    while (true) {
      const existingSlugs = await query(
        "SELECT id FROM posts WHERE slug = $1",
        [slug]
      );
      if (existingSlugs.length === 0) break;
      slug = `${baseSlug}-${counter++}`;
    }

    // Create post
    const insertQuery = `
      INSERT INTO posts (title, slug, content, excerpt, category, status, featured_image, tags, author_id, published_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const publishedAt =
      status === "published" ? new Date().toISOString() : null;

    const newPosts = await query<PostRow>(insertQuery, [
      title,
      slug,
      content,
      excerpt || content.substring(0, 200) + "...",
      category,
      status,
      featured_image || null,
      tags,
      req.user.id,
      publishedAt,
    ]);

    const newPost = newPosts[0]!;

    // Get the complete post with author info
    const completePostQuery = `
      SELECT 
        p.*,
        u.username as author_name
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.id = $1
    `;

    const completePosts = await query<PostRow & { author_name: string }>(
      completePostQuery,
      [newPost.id]
    );
    const completePost = completePosts[0]!;

    // Transform to API format
    const transformedPost = {
      id: completePost.id,
      title: completePost.title,
      slug: completePost.slug,
      content: completePost.content,
      excerpt: completePost.excerpt,
      category: completePost.category as "post" | "announcement",
      status: completePost.status as "draft" | "published",
      featured_image: completePost.featured_image,
      tags: completePost.tags || [],
      author_id: completePost.author_id,
      author_name: completePost.author_name,
      like_count: completePost.like_count,
      love_count: completePost.love_count,
      helpful_count: completePost.helpful_count,
      view_count: completePost.view_count,
      comment_count: 0,
      created_at: completePost.created_at.toISOString(),
      updated_at: completePost.updated_at.toISOString(),
      published_at: completePost.published_at?.toISOString() || "",
    };

    const response: ApiResponse = {
      success: true,
      data: transformedPost,
      message: "Post created successfully",
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Create post error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Failed to create post",
    };
    res.status(500).json(response);
  }
};

export const updatePost = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: "Authentication required",
      };
      res.status(401).json(response);
      return;
    }

    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid post ID",
      };
      res.status(400).json(response);
      return;
    }

    const updateData = req.body as UpdatePostRequest;

    // Check if post exists
    const existingPosts = await query<PostRow>(
      "SELECT * FROM posts WHERE id = $1",
      [parseInt(id)]
    );

    if (existingPosts.length === 0) {
      const response: ApiResponse = {
        success: false,
        error: "Post not found",
      };
      res.status(404).json(response);
      return;
    }

    const existingPost = existingPosts[0]!;

    // Handle slug update if title changed
    let newSlug = existingPost.slug;
    if (updateData.title && updateData.title !== existingPost.title) {
      const baseSlug = slugify(updateData.title, { lower: true, strict: true });
      newSlug = baseSlug;
      let counter = 1;

      // Ensure unique slug (excluding current post)
      while (true) {
        const existingSlugs = await query(
          "SELECT id FROM posts WHERE slug = $1 AND id != $2",
          [newSlug, existingPost.id]
        );
        if (existingSlugs.length === 0) break;
        newSlug = `${baseSlug}-${counter++}`;
      }
    }

    // Handle published_at update
    let publishedAt = existingPost.published_at;
    if (updateData.status === "published" && existingPost.status === "draft") {
      publishedAt = new Date();
    } else if (updateData.status === "draft") {
      publishedAt = null;
    }

    // Build update query dynamically
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 0;

    if (updateData.title !== undefined) {
      updateFields.push(`title = $${++paramCount}`);
      updateValues.push(updateData.title);
      updateFields.push(`slug = $${++paramCount}`);
      updateValues.push(newSlug);
    }

    if (updateData.content !== undefined) {
      updateFields.push(`content = $${++paramCount}`);
      updateValues.push(updateData.content);
    }

    if (updateData.excerpt !== undefined) {
      updateFields.push(`excerpt = $${++paramCount}`);
      updateValues.push(updateData.excerpt);
    }

    if (updateData.category !== undefined) {
      updateFields.push(`category = $${++paramCount}`);
      updateValues.push(updateData.category);
    }

    if (updateData.status !== undefined) {
      updateFields.push(`status = $${++paramCount}`);
      updateValues.push(updateData.status);
      updateFields.push(`published_at = $${++paramCount}`);
      updateValues.push(publishedAt);
    }

    if (updateData.featured_image !== undefined) {
      updateFields.push(`featured_image = $${++paramCount}`);
      updateValues.push(updateData.featured_image);
    }

    if (updateData.tags !== undefined) {
      updateFields.push(`tags = $${++paramCount}`);
      updateValues.push(updateData.tags);
    }

    if (updateFields.length === 0) {
      const response: ApiResponse = {
        success: false,
        error: "No fields to update",
      };
      res.status(400).json(response);
      return;
    }

    const updateQuery = `
      UPDATE posts 
      SET ${updateFields.join(", ")}
      WHERE id = $${++paramCount}
      RETURNING *
    `;
    updateValues.push(parseInt(id));

    const updatedPosts = await query<PostRow>(updateQuery, updateValues);
    const updatedPost = updatedPosts[0]!;

    // Get complete post with author info
    const completePostQuery = `
      SELECT 
        p.*,
        u.username as author_name,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.status = 'approved') as comment_count
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.id = $1
    `;

    const completePosts = await query<
      PostRow & { author_name: string; comment_count: string }
    >(completePostQuery, [updatedPost.id]);
    const completePost = completePosts[0]!;

    // Transform to API format
    const transformedPost = {
      id: completePost.id,
      title: completePost.title,
      slug: completePost.slug,
      content: completePost.content,
      excerpt: completePost.excerpt,
      category: completePost.category as "post" | "announcement",
      status: completePost.status as "draft" | "published",
      featured_image: completePost.featured_image,
      tags: completePost.tags || [],
      author_id: completePost.author_id,
      author_name: completePost.author_name,
      like_count: completePost.like_count,
      love_count: completePost.love_count,
      helpful_count: completePost.helpful_count,
      view_count: completePost.view_count,
      comment_count: parseInt(completePost.comment_count || "0"),
      created_at: completePost.created_at.toISOString(),
      updated_at: completePost.updated_at.toISOString(),
      published_at: completePost.published_at?.toISOString() || "",
    };

    const response: ApiResponse = {
      success: true,
      data: transformedPost,
      message: "Post updated successfully",
    };

    res.json(response);
  } catch (error) {
    console.error("Update post error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Failed to update post",
    };
    res.status(500).json(response);
  }
};

export const deletePost = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: "Authentication required",
      };
      res.status(401).json(response);
      return;
    }

    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid post ID",
      };
      res.status(400).json(response);
      return;
    }

    // Check if post exists
    const existingPosts = await query("SELECT id FROM posts WHERE id = $1", [
      parseInt(id),
    ]);

    if (existingPosts.length === 0) {
      const response: ApiResponse = {
        success: false,
        error: "Post not found",
      };
      res.status(404).json(response);
      return;
    }

    // Delete post (comments and reactions will be cascade deleted)
    await query("DELETE FROM posts WHERE id = $1", [parseInt(id)]);

    const response: ApiResponse = {
      success: true,
      message: "Post deleted successfully",
    };

    res.json(response);
  } catch (error) {
    console.error("Delete post error:", error);
    const response: ApiResponse = {
      success: false,
      error: "Failed to delete post",
    };
    res.status(500).json(response);
  }
};
