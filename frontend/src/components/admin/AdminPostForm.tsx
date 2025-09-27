import React, { useState, useEffect } from "react";
import { Save, X, Eye, Upload, Tag } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
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

interface PostFormData {
  title: string;
  content: string;
  excerpt: string;
  category: "post" | "announcement";
  status: "draft" | "published";
  featured_image: string;
  tags: string[];
}

interface AdminPostFormProps {
  post?: Post | null;
  onSave: (postData: PostFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const AdminPostForm: React.FC<AdminPostFormProps> = ({
  post,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    content: "",
    excerpt: "",
    category: "post",
    status: "draft",
    featured_image: "",
    tags: [],
  });

  const [tagInput, setTagInput] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        category: post.category,
        status: post.status,
        featured_image: post.featured_image || "",
        tags: post.tags,
      });
    }
  }, [post]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      console.error("Error saving post:", error);
    }
  };

  const handleChange = (
    field: keyof PostFormData,
    value: string | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Auto-generate excerpt from content if excerpt is empty
    if (field === "content" && !formData.excerpt) {
      const excerptText =
        (value as string).replace(/<[^>]*>/g, "").substring(0, 200) + "...";
      setFormData((prev) => ({ ...prev, excerpt: excerptText }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleChange("tags", [...formData.tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleChange(
      "tags",
      formData.tags.filter((tag) => tag !== tagToRemove)
    );
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {post ? "Edit Post" : "Create New Post"}
          </h1>
          <p className="text-gray-600">
            {post
              ? "Update your existing post"
              : "Write a new blog post or announcement"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {isPreviewMode ? "Edit" : "Preview"}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>

      {isPreviewMode ? (
        /* Preview Mode */
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge
                className={
                  formData.category === "announcement"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-purple-100 text-purple-800"
                }
              >
                {formData.category === "announcement" ? "Announcement" : "Post"}
              </Badge>
              <Badge
                className={
                  formData.status === "published"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }
              >
                {formData.status}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {formData.title || "Untitled"}
            </h1>
            {formData.featured_image && (
              <img
                src={formData.featured_image}
                alt="Featured"
                className="w-full h-64 object-cover rounded-lg"
              />
            )}
            <p className="text-gray-600 italic">{formData.excerpt}</p>
            <div className="prose max-w-none">
              <div
                dangerouslySetInnerHTML={{
                  __html: formData.content.replace(/\n/g, "<br>"),
                }}
              />
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Card>
      ) : (
        /* Edit Mode */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Enter post title..."
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      handleChange(
                        "category",
                        e.target.value as "post" | "announcement"
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="post">Blog Post</option>
                    <option value="announcement">Announcement</option>
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.category}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      handleChange(
                        "status",
                        e.target.value as "draft" | "published"
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Featured Image URL
                </label>
                <div className="flex gap-2">
                  <Input
                    value={formData.featured_image}
                    onChange={(e) =>
                      handleChange("featured_image", e.target.value)
                    }
                    placeholder="https://example.com/image.jpg"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Content */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Content</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Excerpt
                </label>
                <Textarea
                  value={formData.excerpt}
                  onChange={(e) => handleChange("excerpt", e.target.value)}
                  placeholder="Brief description of the post..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => handleChange("content", e.target.value)}
                  placeholder="Write your post content here..."
                  rows={12}
                  className={errors.content ? "border-red-500" : ""}
                />
                {errors.content && (
                  <p className="text-red-500 text-sm mt-1">{errors.content}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Tags */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Tags</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  placeholder="Add tags..."
                  className="flex-1"
                />
                <Button type="button" onClick={addTag} variant="outline">
                  <Tag className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-red-50"
                      onClick={() => removeTag(tag)}
                    >
                      #{tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {post ? "Update Post" : "Create Post"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
