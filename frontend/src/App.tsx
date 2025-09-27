import React, { useState, useEffect } from "react";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { Hero } from "./components/home/Hero";
import { FeaturedPosts } from "./components/home/FeaturedPosts";
import { ServicesOverview } from "./components/home/ServicesOverview";
import { PostList } from "./components/posts/PostList";
import { PostDetail } from "./components/posts/PostDetail";
import { AdminPage } from "./components/admin/AdminPage";
import { Post } from "./types";

type ViewMode = "home" | "posts" | "announcements" | "post-detail" | "admin";

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>("home");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Check if current path is admin
  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/admin" || path.startsWith("/admin/")) {
      setCurrentView("admin");
    }
  }, []);

  const handlePostSelect = (post: Post) => {
    setSelectedPost(post);
    setCurrentView("post-detail");
  };

  const handleBackToHome = () => {
    setCurrentView("home");
    setSelectedPost(null);
  };

  const handleBackToPosts = () => {
    setCurrentView("posts");
    setSelectedPost(null);
  };

  const handleViewAllPosts = () => {
    setCurrentView("posts");
  };

  const handleViewAnnouncements = () => {
    setCurrentView("announcements");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentView("posts");
  };

  const renderContent = () => {
    switch (currentView) {
      case "home":
        return (
          <>
            <Hero />
            <FeaturedPosts
              onPostSelect={handlePostSelect}
              onViewAll={handleViewAllPosts}
            />
            <ServicesOverview />
          </>
        );

      case "posts":
        return (
          <main className="py-16 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <PostList onPostSelect={handlePostSelect} />
            </div>
          </main>
        );

      case "announcements":
        return (
          <main className="py-16 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <PostList
                category="announcement"
                onPostSelect={handlePostSelect}
              />
            </div>
          </main>
        );

      case "post-detail":
        return (
          <main className="py-16 bg-gray-50 min-h-screen">
            {selectedPost && (
              <PostDetail post={selectedPost} onBack={handleBackToPosts} />
            )}
          </main>
        );

      case "admin":
        return <AdminPage />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {currentView !== "admin" && <Header onSearch={handleSearch} />}
      {renderContent()}
      {currentView !== "admin" && <Footer />}

      {/* Print Styles */}
      <style>{`
        @media print {
          header, footer, nav, .no-print {
            display: none !important;
          }
          
          .print-content {
            margin: 0;
            padding: 20px;
          }
          
          .print-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          
          .print-meta {
            font-size: 12px;
            color: #666;
            margin-bottom: 20px;
          }
          
          .print-content img {
            max-width: 100%;
            height: auto;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
