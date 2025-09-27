import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import { Comment } from '../../types';
import { formatRelativeTime } from '../../lib/utils';
import { api } from '../../lib/api';
import { User, Send } from 'lucide-react';

interface CommentSectionProps {
  postId: number;
  comments: Comment[];
  onCommentAdded: (comment: Comment) => void;
}

export function CommentSection({ postId, comments, onCommentAdded }: CommentSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    author_name: '',
    author_email: '',
    content: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.author_name.trim()) {
      newErrors.author_name = 'Name is required';
    }

    if (!formData.author_email.trim()) {
      newErrors.author_email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.author_email)) {
      newErrors.author_email = 'Please enter a valid email address';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Comment is required';
    } else if (formData.content.trim().length < 10) {
      newErrors.content = 'Comment must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const newComment = await api.addComment(postId, {
        author_name: formData.author_name.trim(),
        author_email: formData.author_email.trim(),
        content: formData.content.trim()
      });
      
      onCommentAdded(newComment);
      setFormData({ author_name: '', author_email: '', content: '' });
      setErrors({});
    } catch (error) {
      console.error('Failed to submit comment:', error);
      setErrors({ submit: 'Failed to submit comment. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <Card className="p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Leave a Comment</h4>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <Input
                id="name"
                type="text"
                value={formData.author_name}
                onChange={(e) => handleInputChange('author_name', e.target.value)}
                placeholder="Your full name"
                className={errors.author_name ? 'border-red-500' : ''}
              />
              {errors.author_name && (
                <p className="text-red-600 text-sm mt-1">{errors.author_name}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <Input
                id="email"
                type="email"
                value={formData.author_email}
                onChange={(e) => handleInputChange('author_email', e.target.value)}
                placeholder="your.email@example.com"
                className={errors.author_email ? 'border-red-500' : ''}
              />
              {errors.author_email && (
                <p className="text-red-600 text-sm mt-1">{errors.author_email}</p>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
              Comment *
            </label>
            <Textarea
              id="comment"
              rows={4}
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Share your thoughts about this post..."
              className={errors.content ? 'border-red-500' : ''}
            />
            {errors.content && (
              <p className="text-red-600 text-sm mt-1">{errors.content}</p>
            )}
          </div>
          
          {errors.submit && (
            <p className="text-red-600 text-sm">{errors.submit}</p>
          )}
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>Posting...</>
              ) : (
                <>
                  <Send size={16} className="mr-2" />
                  Post Comment
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-500">
              No comments yet. Be the first to share your thoughts!
            </p>
          </Card>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className="p-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User size={16} className="text-gray-600" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h5 className="text-sm font-medium text-gray-900">
                      {comment.author_name}
                    </h5>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">
                      {formatRelativeTime(comment.created_at)}
                    </span>
                    {comment.status === 'pending' && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Pending Approval
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}