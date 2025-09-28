import React, { useState, useEffect } from "react";
import { Search, Filter, Calendar, TrendingUp } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { PostCard } from "./PostCard";
import { Post } from "../../types";
import { api } from "../../lib/api";

interface PostListProps {
  category?: "post" | "announcement";
}

export function PostList({ category }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    category || ""
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [sortBy, setSortBy] = useState<"recent" | "popular">("recent");

  const postsPerPage = 9;
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  useEffect(() => {
    loadPosts();
  }, [currentPage, selectedCategory, searchQuery, sortBy]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const { posts: fetchedPosts, total } = await api.getPosts(
        currentPage,
        postsPerPage,
        selectedCategory || undefined,
        searchQuery || undefined
      );

      // Sort posts based on selected criteria
      const sortedPosts = [...fetchedPosts].sort((a, b) => {
        if (sortBy === "popular") {
          return (
            b.view_count +
            b.like_count +
            b.love_count +
            b.helpful_count -
            (a.view_count + a.like_count + a.love_count + a.helpful_count)
          );
        }
        return (
          new Date(b.published_at).getTime() -
          new Date(a.published_at).getTime()
        );
      });

      setPosts(sortedPosts);
      setTotalPosts(total);
    } catch (error) {
      console.error("Failed to load posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: "recent" | "popular") => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const categories = [
    { id: "", label: "All Posts", count: totalPosts },
    { id: "post", label: "News & Updates", count: 0 },
    { id: "announcement", label: "Announcements", count: 0 },
  ];

  if (loading && posts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <div className="p-6 space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {category === "announcement"
            ? "Municipal Announcements"
            : category === "post"
              ? "Latest News & Updates"
              : "All Posts & Announcements"}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Stay informed with the latest news, updates, and important
          announcements from the Municipality of Santa Maria.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Input
                type="text"
                placeholder="Search posts and announcements..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange(cat.id)}
                className="flex items-center gap-2"
              >
                {cat.id === "announcement" && <Filter size={14} />}
                {cat.label}
              </Button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex gap-2">
            <Button
              variant={sortBy === "recent" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSortChange("recent")}
            >
              <Calendar size={14} className="mr-2" />
              Recent
            </Button>
            <Button
              variant={sortBy === "popular" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSortChange("popular")}
            >
              <TrendingUp size={14} className="mr-2" />
              Popular
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {(searchQuery || selectedCategory) && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchQuery && (
              <Badge variant="secondary">
                Search: "{searchQuery}"
                <button
                  onClick={() => handleSearch("")}
                  className="ml-2 hover:text-red-600"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedCategory && (
              <Badge variant="secondary">
                Category:{" "}
                {categories.find((c) => c.id === selectedCategory)?.label}
                <button
                  onClick={() => handleCategoryChange("")}
                  className="ml-2 hover:text-red-600"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {posts.length} of {totalPosts} posts
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <Card className="p-12 text-center">
          <Search size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No posts found
          </h3>
          <p className="text-gray-500">
            {searchQuery
              ? `No posts match your search for "${searchQuery}".`
              : "No posts available at the moment."}
          </p>
          {searchQuery && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => handleSearch("")}
            >
              Clear Search
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} showExcerpt={true} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || loading}
          >
            Previous
          </Button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + 1;
            const isCurrentPage = page === currentPage;

            return (
              <Button
                key={page}
                variant={isCurrentPage ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                disabled={loading}
              >
                {page}
              </Button>
            );
          })}

          {totalPages > 5 && currentPage < totalPages - 2 && (
            <>
              <span className="px-2">...</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={loading}
              >
                {totalPages}
              </Button>
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages || loading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
