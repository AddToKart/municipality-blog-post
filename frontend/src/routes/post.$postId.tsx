import {
  createFileRoute,
  useParams,
  useNavigate,
} from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { PostDetail } from "../components/posts/PostDetail";
import { Post } from "../types";
import { api } from "../lib/api";

function PostDetailPage() {
  const { postId } = useParams({ from: "/post/$postId" });
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set page title
  if (typeof window !== "undefined") {
    document.title = `Post: ${postId} - Santa Maria Municipality`;
  }

  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        setError(null);
        let fetchedPost: Post | null = null;

        // Check if postId is a number (ID) or string (slug)
        const numericId = parseInt(postId);
        if (!isNaN(numericId) && numericId.toString() === postId) {
          // It's a numeric ID
          fetchedPost = await api.getPost(numericId);
        } else {
          // It's a slug
          fetchedPost = await api.getPostBySlug(postId);
        }

        setPost(fetchedPost);
        if (!fetchedPost) {
          setError("Post not found");
        }
      } catch (err) {
        console.error("Error loading post:", err);
        setError("Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Post Not Found
                </h1>
                <p className="text-gray-600 mb-4">
                  The post "{postId}" you're looking for doesn't exist or has
                  been removed.
                </p>
                <div className="text-sm text-gray-500 mb-8">
                  <p>Debug info:</p>
                  <p>Post ID/Slug: {postId}</p>
                  <p>Error: {error}</p>
                  <p>Loading: {loading ? "Yes" : "No"}</p>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => navigate({ to: "/posts" })}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <ArrowLeft className="mr-2" size={16} />
                  Back to Posts
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        {/* Back button */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate({ to: "/posts" })}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-6"
          >
            <ArrowLeft className="mr-2" size={20} />
            Back to Posts
          </button>
        </div>
        <PostDetail post={post} />
      </main>
      <Footer />
    </div>
  );
}

export const Route = createFileRoute("/post/$postId")({
  component: PostDetailPage,
});
