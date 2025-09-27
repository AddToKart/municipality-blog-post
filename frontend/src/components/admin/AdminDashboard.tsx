import React, { useState, useEffect } from "react";
import { AdminPostList } from "./AdminPostList";
import { AdminPostForm } from "./AdminPostForm";
import { LogOut, User, Home } from "lucide-react";
import { Button } from "../ui/button";

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

interface PostFormData {
  title: string;
  content: string;
  excerpt: string;
  category: "post" | "announcement";
  status: "draft" | "published";
  featured_image: string;
  tags: string[];
}

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export const AdminDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<"posts" | "create" | "edit">(
    "posts"
  );
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get current user info
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const API_BASE_URL =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData.data);
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleCreatePost = () => {
    setSelectedPost(null);
    setCurrentView("create");
  };

  const handleEditPost = (post: Post) => {
    setSelectedPost(post);
    setCurrentView("edit");
  };

  const handleDeletePost = (postId: number) => {
    // This is handled in AdminPostList component
    console.log("Post deleted:", postId);
  };

  const handleSavePost = async (postData: PostFormData) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const API_BASE_URL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      const url = selectedPost
        ? `${API_BASE_URL}/posts/${selectedPost.id}`
        : `${API_BASE_URL}/posts`;

      const method = selectedPost ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error("Failed to save post");
      }

      // Return to posts list
      setCurrentView("posts");
      setSelectedPost(null);
    } catch (error) {
      console.error("Error saving post:", error);
      alert("Failed to save post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCurrentView("posts");
    setSelectedPost(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Santa Maria Blog Admin
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {currentUser && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{currentUser.username}</span>
                  <span className="text-gray-400">({currentUser.role})</span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("/", "_blank")}
              >
                <Home className="w-4 h-4 mr-2" />
                View Site
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setCurrentView("posts")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === "posts"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Posts
            </button>
            <button
              onClick={handleCreatePost}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === "create" || currentView === "edit"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {currentView === "edit" ? "Edit Post" : "Create Post"}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {currentView === "posts" && (
          <AdminPostList
            onCreatePost={handleCreatePost}
            onEditPost={handleEditPost}
            onDeletePost={handleDeletePost}
          />
        )}

        {(currentView === "create" || currentView === "edit") && (
          <AdminPostForm
            post={selectedPost}
            onSave={handleSavePost}
            onCancel={handleCancel}
            isLoading={loading}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © 2025 Municipality of Santa Maria. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
