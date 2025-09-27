import React, { useState, useEffect } from 'react';
import { ArrowRight, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { PostCard } from '../posts/PostCard';
import { Post } from '../../types';
import { api } from '../../lib/api';

interface FeaturedPostsProps {
  onPostSelect?: (post: Post) => void;
  onViewAll?: () => void;
}

export function FeaturedPosts({ onPostSelect, onViewAll }: FeaturedPostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [announcements, setAnnouncements] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedContent();
  }, []);

  const loadFeaturedContent = async () => {
    try {
      const [postsResult, announcementsResult] = await Promise.all([
        api.getPosts(1, 3, 'post'),
        api.getPosts(1, 2, 'announcement')
      ]);
      
      setPosts(postsResult.posts);
      setAnnouncements(announcementsResult.posts);
    } catch (error) {
      console.error('Failed to load featured content:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-300 rounded w-64 mx-auto"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-300 h-80 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Important Announcements */}
        {announcements.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Important Announcements
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Critical updates and announcements from the Municipal Government
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {announcements.map((post) => (
                <div key={post.id} className="relative">
                  <PostCard
                    post={post}
                    onClick={() => onPostSelect?.(post)}
                    showExcerpt={true}
                  />
                  {/* Priority indicator */}
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 shadow-lg">
                    <TrendingUp size={16} />
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button variant="outline" onClick={() => onViewAll?.()}>
                View All Announcements
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Latest Posts */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Latest News & Updates
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Stay informed with the latest developments and initiatives in our municipality
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onClick={() => onPostSelect?.(post)}
                showExcerpt={true}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button onClick={() => onViewAll?.()}>
              <Calendar size={16} className="mr-2" />
              View All Posts
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}