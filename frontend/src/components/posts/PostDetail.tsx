import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  User, 
  Eye, 
  Clock, 
  Tag, 
  Share2, 
  Printer,
  ThumbsUp,
  Heart,
  HelpCircle,
  MessageSquare,
  ArrowLeft
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Post, Comment, ReactionCounts } from '../../types';
import { formatDate, getReadingTime, sharePost } from '../../lib/utils';
import { api } from '../../lib/api';
import { CommentSection } from './CommentSection';

interface PostDetailProps {
  post: Post;
  onBack?: () => void;
}

export function PostDetail({ post, onBack }: PostDetailProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [reactions, setReactions] = useState<ReactionCounts>({
    like: post.like_count,
    love: post.love_count,
    helpful: post.helpful_count
  });
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComments();
    loadReactions();
  }, [post.id]);

  const loadComments = async () => {
    try {
      const postComments = await api.getComments(post.id);
      setComments(postComments);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const loadReactions = async () => {
    try {
      const counts = await api.getReactionCounts(post.id);
      setReactions(counts);
    } catch (error) {
      console.error('Failed to load reactions:', error);
    }
  };

  const handleReaction = async (reactionType: 'like' | 'love' | 'helpful') => {
    if (loading) return;
    
    setLoading(true);
    try {
      const newCounts = await api.addReaction(post.id, reactionType);
      setReactions(newCounts);
      setUserReaction(reactionType);
    } catch (error) {
      console.error('Failed to add reaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    sharePost({ title: post.title, slug: post.slug });
  };

  const reactionButtons = [
    { 
      type: 'like' as const, 
      icon: ThumbsUp, 
      label: 'Helpful', 
      count: reactions.like,
      color: 'text-blue-600'
    },
    { 
      type: 'love' as const, 
      icon: Heart, 
      label: 'Love', 
      count: reactions.love,
      color: 'text-red-600'
    },
    { 
      type: 'helpful' as const, 
      icon: HelpCircle, 
      label: 'Informative', 
      count: reactions.helpful,
      color: 'text-green-600'
    },
  ];

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      {onBack && (
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 -ml-2"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Posts
        </Button>
      )}

      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Badge 
            variant={post.category === 'announcement' ? 'destructive' : 'default'}
            className="capitalize"
          >
            {post.category}
          </Badge>
          {post.category === 'announcement' && (
            <Badge variant="outline" className="text-red-600 border-red-200">
              Important Notice
            </Badge>
          )}
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
          {post.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{formatDate(post.published_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            <User size={14} />
            <span>{post.author_name || 'Municipal Administrator'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{getReadingTime(post.content)} minute read</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye size={14} />
            <span>{post.view_count.toLocaleString()} views</span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 size={14} className="mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer size={14} className="mr-2" />
            Print
          </Button>
        </div>
      </header>

      {/* Featured Image */}
      {post.featured_image && (
        <div className="mb-8">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
          />
        </div>
      )}

      {/* Content */}
      <div className="prose prose-lg max-w-none mb-8">
        <div 
          dangerouslySetInnerHTML={{ __html: post.content }}
          className="text-gray-800 leading-relaxed"
        />
      </div>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Tags:</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                <Tag size={12} className="mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Reactions */}
      <Card className="mb-8 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Was this helpful?</h3>
        <div className="flex flex-wrap gap-3">
          {reactionButtons.map(({ type, icon: Icon, label, count, color }) => (
            <Button
              key={type}
              variant={userReaction === type ? "default" : "outline"}
              size="sm"
              onClick={() => handleReaction(type)}
              disabled={loading}
              className={`flex items-center gap-2 ${userReaction === type ? '' : 'hover:' + color}`}
            >
              <Icon size={16} className={userReaction === type ? 'text-white' : color} />
              <span>{label}</span>
              <span className="ml-1 text-sm">({count})</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Comments */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare size={20} />
          <h3 className="text-xl font-semibold text-gray-900">
            Comments ({comments.length})
          </h3>
        </div>
        
        <CommentSection
          postId={post.id}
          comments={comments}
          onCommentAdded={(newComment) => setComments([...comments, newComment])}
        />
      </div>
    </article>
  );
}