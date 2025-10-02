import {
  Calendar,
  User,
  Eye,
  MessageSquare,
  Clock,
  Tag,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { Separator } from "../ui/separator";
import { Post } from "../../types";
import { formatDate, getReadingTime, stripHtml, cn } from "../../lib/utils";

interface PostCardProps {
  post: Post;
  onClick?: () => void;
  showExcerpt?: boolean;
}

export function PostCard({ post, onClick, showExcerpt = true }: PostCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    // Always navigate to post detail using Tanstack Router
    // Use post ID if slug is null/undefined, otherwise use slug
    const postIdentifier = post.slug && post.slug.trim() ? post.slug : post.id;
    navigate({ to: `/post/${postIdentifier}` });

    // Call optional onClick callback if provided
    if (onClick) {
      onClick();
    }
  };

  const totalReactions = post.like_count + post.love_count + post.helpful_count;
  const isHot = post.view_count > 100 || totalReactions > 20;
  const isNew =
    new Date(post.published_at) >
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return (
    <Card
      className={cn(
        "group cursor-pointer overflow-hidden transition-all duration-300",
        "hover:shadow-xl hover:shadow-primary/5 hover:scale-[1.02] hover:border-primary/50",
        "relative"
      )}
      onClick={handleClick}
    >
      {/* Featured Image */}
      {post.featured_image && (
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
          />

          {/* Category Badge */}
          <div className="absolute top-4 left-4 z-20 flex gap-2">
            <Badge
              variant={
                post.category === "announcement" ? "destructive" : "default"
              }
              className={cn(
                "capitalize backdrop-blur-sm font-semibold shadow-lg",
                post.category === "announcement" && "animate-pulse"
              )}
            >
              {post.category}
            </Badge>

            {isNew && (
              <Badge
                variant="secondary"
                className="backdrop-blur-sm bg-emerald-500 text-white border-0"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                New
              </Badge>
            )}
          </div>

          {/* Status Badges */}
          <div className="absolute top-4 right-4 z-20 flex gap-2">
            {post.category === "announcement" && (
              <Badge className="backdrop-blur-sm bg-background/90 text-destructive border-destructive/20">
                Important
              </Badge>
            )}
            {isHot && (
              <Badge className="backdrop-blur-sm bg-orange-500 text-white border-0">
                <TrendingUp className="w-3 h-3 mr-1" />
                Hot
              </Badge>
            )}
          </div>

          {/* Read More Overlay */}
          <div className="absolute bottom-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
              Read More
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      <CardHeader className="space-y-3">
        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <HoverCard openDelay={200}>
            <HoverCardTrigger asChild>
              <div className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-help">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(post.published_at)}</span>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-64">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Publication Date</h4>
                <p className="text-sm text-muted-foreground">
                  This post was published on{" "}
                  {new Date(post.published_at).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>

          <Separator orientation="vertical" className="h-4" />

          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span>{post.author_name || "Admin"}</span>
          </div>

          <Separator orientation="vertical" className="h-4" />

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{getReadingTime(post.content)} min</span>
          </div>
        </div>

        {/* Title */}
        <CardTitle className="text-xl group-hover:text-primary transition-colors duration-200 line-clamp-2">
          {post.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Excerpt */}
        {showExcerpt && (
          <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
            {post.excerpt || stripHtml(post.content).slice(0, 150) + "..."}
          </p>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs hover:bg-secondary/80 transition-colors"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
            {post.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{post.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <Separator />

        {/* Engagement Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-muted-foreground">
            <HoverCard openDelay={200}>
              <HoverCardTrigger asChild>
                <div className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-help">
                  <Eye className="w-4 h-4" />
                  <span className="font-medium">
                    {post.view_count.toLocaleString()}
                  </span>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-48">
                <p className="text-sm">Total views from all readers</p>
              </HoverCardContent>
            </HoverCard>

            <HoverCard openDelay={200}>
              <HoverCardTrigger asChild>
                <div className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-help">
                  <MessageSquare className="w-4 h-4" />
                  <span className="font-medium">{post.comment_count}</span>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-48">
                <p className="text-sm">Comments from the community</p>
              </HoverCardContent>
            </HoverCard>
          </div>

          <HoverCard openDelay={200}>
            <HoverCardTrigger asChild>
              <div className="flex items-center gap-2 text-xs cursor-help">
                <span className="hover:scale-110 transition-transform">
                  👍 {post.like_count}
                </span>
                <span className="hover:scale-110 transition-transform">
                  ❤️ {post.love_count}
                </span>
                <span className="hover:scale-110 transition-transform">
                  💡 {post.helpful_count}
                </span>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-56">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Reactions</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>👍 Like: {post.like_count} reactions</p>
                  <p>❤️ Love: {post.love_count} reactions</p>
                  <p>💡 Helpful: {post.helpful_count} reactions</p>
                  <Separator className="my-2" />
                  <p className="font-medium text-foreground">
                    Total: {totalReactions} reactions
                  </p>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardContent>
    </Card>
  );
}
