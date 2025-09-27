import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  Tag,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: "post" | "announcement";
  status: "draft" | "published";
  featured_image: string | null;
  tags: string[];
  author_id: number;
  author_name: string;
  like_count: number;
  love_count: number;
  helpful_count: number;
  view_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  published_at: string;
}

interface PostsResponse {
  success: boolean;
  data: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface AdminPostListProps {
  onCreatePost: () => void;
  onEditPost: (post: Post) => void;
  onDeletePost: (postId: number) => void;
}

export const AdminPostList: React.FC<AdminPostListProps> = ({
  onCreatePost,
  onEditPost,
  onDeletePost,
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<
    PostsResponse["pagination"] | null
  >(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });

      if (searchTerm) params.append("search", searchTerm);
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (filterCategory !== "all") params.append("category", filterCategory);

      const token = localStorage.getItem("authToken");
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      const response = await fetch(`${API_BASE_URL}/posts?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data: PostsResponse = await response.json();
      setPosts(data.data);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [currentPage, searchTerm, filterStatus, filterCategory]);

  const handleDelete = async (postId: number) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      // Refresh the posts list
      fetchPosts();
      onDeletePost(postId);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete post");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: Post["status"]) => {
    return status === "published" ? (
      <Badge className="bg-green-100 text-green-800">Published</Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>
    );
  };

  const getCategoryBadge = (category: Post["category"]) => {
    return category === "announcement" ? (
      <Badge className="bg-blue-100 text-blue-800">Announcement</Badge>
    ) : (
      <Badge className="bg-purple-100 text-purple-800">Post</Badge>
    );
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <Button onClick={fetchPosts}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Posts Management</h1>
          <p className="text-gray-600">
            Manage your blog posts and announcements
          </p>
        </div>
        <Button
          onClick={onCreatePost}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Post
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="post">Posts</option>
            <option value="announcement">Announcements</option>
          </select>
        </div>
      </Card>

      {/* Posts List */}
      {posts.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-600 mb-4">No posts found</p>
          <Button
            onClick={onCreatePost}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Post
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                      {post.title}
                    </h3>
                    {getStatusBadge(post.status)}
                    {getCategoryBadge(post.category)}
                  </div>

                  <p className="text-gray-600 line-clamp-2">{post.excerpt}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{post.author_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{post.view_count} views</span>
                    </div>
                    {post.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        <span>{post.tags.join(", ")}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditPost(post)}
                    className="hover:bg-blue-50"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(post.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} results
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(pagination.page - 1)}
              disabled={!pagination.hasPrev}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(pagination.page + 1)}
              disabled={!pagination.hasNext}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
