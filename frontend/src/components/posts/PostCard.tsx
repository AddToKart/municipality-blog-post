import React from 'react';
import { Calendar, User, Eye, MessageSquare, Clock, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Post } from '../../types';
import { formatDate, getReadingTime, stripHtml } from '../../lib/utils';

interface PostCardProps {
  post: Post;
  onClick?: () => void;
  showExcerpt?: boolean;
}

export function PostCard({ post, onClick, showExcerpt = true }: PostCardProps) {
  return (
    <Card 
      className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
      onClick={onClick}
    >
      {post.featured_image && (
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 left-4">
            <Badge 
              variant={post.category === 'announcement' ? 'destructive' : 'default'}
              className="capitalize"
            >
              {post.category}
            </Badge>
          </div>
          {post.category === 'announcement' && (
            <div className="absolute top-4 right-4">
              <Badge variant="outline" className="bg-white/90 text-red-600 border-red-200">
                Important
              </Badge>
            </div>
          )}
        </div>
      )}
      
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-2">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{formatDate(post.published_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            <User size={14} />
            <span>{post.author_name || 'Admin'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{getReadingTime(post.content)} min read</span>
          </div>
        </div>
        
        <CardTitle className="group-hover:text-blue-600 transition-colors duration-200">
          {post.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {showExcerpt && (
          <p className="text-gray-600 mb-4 line-clamp-3">
            {post.excerpt || stripHtml(post.content).slice(0, 150) + '...'}
          </p>
        )}
        
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                <Tag size={10} className="mr-1" />
                {tag}
              </Badge>
            ))}
            {post.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{post.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
        
        {/* Engagement Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-1">
              <Eye size={14} />
              <span>{post.view_count.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare size={14} />
              <span>{post.comment_count}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs">
              👍 {post.like_count} • ❤️ {post.love_count} • 👍 {post.helpful_count}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}