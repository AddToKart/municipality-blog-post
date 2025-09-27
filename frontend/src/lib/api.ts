import { Post, Comment, ReactionCounts } from "../types";

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken");
};

// Helper function to make API requests
const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }

  return data;
};

// Legacy mock data for fallback (keep some for initial display)
const mockPosts: Post[] = [
  {
    id: 1,
    title: "Santa Maria Municipality Launches New Digital Services Portal",
    slug: "digital-services-portal-launch",
    content: `<p>We are excited to announce the launch of our new digital services portal, making it easier than ever for residents to access municipal services online.</p>

<p>The new portal includes:</p>
<ul>
<li>Online permit applications</li>
<li>Tax payment services</li>
<li>Document requests</li>
<li>Service status tracking</li>
<li>Community announcements</li>
</ul>

<p>This initiative is part of our commitment to modernize municipal services and provide better convenience for our residents. The portal is accessible 24/7 and designed to be user-friendly for all age groups.</p>

<p>To access the portal, visit our official website and click on the "Digital Services" tab. First-time users will need to create an account using a valid email address and proof of residency.</p>`,
    excerpt:
      "Santa Maria Municipality introduces a comprehensive digital services portal to streamline resident access to municipal services online.",
    category: "announcement",
    status: "published",
    featured_image:
      "https://images.pexels.com/photos/5473298/pexels-photo-5473298.jpeg?auto=compress&cs=tinysrgb&w=1200",
    tags: ["digital services", "technology", "municipal services"],
    author_id: 1,
    like_count: 45,
    love_count: 23,
    helpful_count: 67,
    view_count: 1250,
    comment_count: 12,
    created_at: "2024-01-15T08:00:00Z",
    updated_at: "2024-01-15T08:00:00Z",
    published_at: "2024-01-15T08:00:00Z",
    author_name: "Municipal Administrator",
  },
  {
    id: 2,
    title: "Road Improvement Project on Main Street Begins Next Week",
    slug: "main-street-road-improvement",
    content: `<p>The Municipality of Santa Maria will begin a major road improvement project on Main Street starting Monday, January 22, 2024.</p>

<p><strong>Project Details:</strong></p>
<ul>
<li>Duration: 6-8 weeks</li>
<li>Area: Main Street from City Hall to Market Plaza</li>
<li>Work Hours: 7:00 AM to 5:00 PM, Monday to Saturday</li>
<li>Budget: ₱15.5 Million</li>
</ul>

<p><strong>Traffic Management:</strong></p>
<p>During construction, traffic will be redirected through alternate routes. Temporary signage and traffic enforcers will be stationed at key intersections to guide motorists.</p>

<p><strong>What to Expect:</strong></p>
<ul>
<li>Complete road resurfacing</li>
<li>New drainage systems</li>
<li>LED street lighting installation</li>
<li>Sidewalk repairs and improvements</li>
<li>Traffic signal upgrades</li>
</ul>

<p>We apologize for any inconvenience this may cause and appreciate your patience as we work to improve our infrastructure.</p>`,
    excerpt:
      "Major road improvement project on Main Street will enhance infrastructure and traffic flow, with completion expected in 6-8 weeks.",
    category: "post",
    status: "published",
    featured_image:
      "https://images.pexels.com/photos/162539/architecture-building-amsterdam-blue-sky-162539.jpeg?auto=compress&cs=tinysrgb&w=1200",
    tags: ["infrastructure", "road improvement", "traffic"],
    author_id: 1,
    like_count: 28,
    love_count: 8,
    helpful_count: 42,
    view_count: 890,
    comment_count: 7,
    created_at: "2024-01-12T10:30:00Z",
    updated_at: "2024-01-12T10:30:00Z",
    published_at: "2024-01-12T10:30:00Z",
    author_name: "Public Works Department",
  },
  {
    id: 3,
    title:
      "Annual Santa Maria Festival 2024: Celebrating Culture and Community",
    slug: "santa-maria-festival-2024",
    content: `<p>Join us for the 45th Annual Santa Maria Festival from March 15-19, 2024! This year's theme is "Unity in Diversity: Celebrating Our Heritage."</p>

<p><strong>Festival Highlights:</strong></p>
<ul>
<li><strong>Opening Ceremony:</strong> March 15, 6:00 PM at Municipal Plaza</li>
<li><strong>Cultural Parade:</strong> March 16, 9:00 AM starting from City Hall</li>
<li><strong>Food Festival:</strong> March 17-18, all day at Market Square</li>
<li><strong>Arts and Crafts Fair:</strong> March 15-19, Municipal Park</li>
<li><strong>Concert Series:</strong> Nightly performances at 7:00 PM</li>
</ul>

<p><strong>Featured Activities:</strong></p>
<ul>
<li>Traditional dance competitions</li>
<li>Local cuisine showcases</li>
<li>Historical exhibits</li>
<li>Children's games and activities</li>
<li>Fireworks display (March 19)</li>
</ul>

<p>This festival celebrates our rich cultural heritage and brings together families and communities. Local businesses and cultural groups are invited to participate in this wonderful celebration.</p>

<p><strong>Vendor Applications:</strong> Open until February 15, 2024. Contact the Tourism Office for registration details.</p>`,
    excerpt:
      "The 45th Annual Santa Maria Festival returns March 15-19, 2024, featuring cultural parades, food festivals, and community celebrations.",
    category: "announcement",
    status: "published",
    featured_image:
      "https://images.pexels.com/photos/1387174/pexels-photo-1387174.jpeg?auto=compress&cs=tinysrgb&w=1200",
    tags: ["festival", "culture", "community", "celebration"],
    author_id: 1,
    like_count: 78,
    love_count: 45,
    helpful_count: 23,
    view_count: 2100,
    comment_count: 25,
    created_at: "2024-01-10T14:00:00Z",
    updated_at: "2024-01-10T14:00:00Z",
    published_at: "2024-01-10T14:00:00Z",
    author_name: "Tourism Office",
  },
  {
    id: 4,
    title: "New Health Center Opens in Barangay San Jose",
    slug: "new-health-center-barangay-san-jose",
    content: `<p>A new state-of-the-art health center has officially opened in Barangay San Jose, expanding healthcare access for residents in the southern district of Santa Maria.</p>

<p><strong>Facility Features:</strong></p>
<ul>
<li>General consultation rooms</li>
<li>Emergency care unit</li>
<li>Maternal and child health services</li>
<li>Pharmacy and laboratory</li>
<li>Dental services</li>
<li>Vaccination center</li>
</ul>

<p><strong>Operating Hours:</strong></p>
<ul>
<li>Monday to Friday: 7:00 AM - 7:00 PM</li>
<li>Saturday: 8:00 AM - 5:00 PM</li>
<li>Sunday: Emergency services only</li>
</ul>

<p>The health center is staffed by qualified medical professionals including doctors, nurses, midwives, and support staff. All services are provided free of charge to residents with valid municipal identification.</p>

<p>This facility represents our commitment to ensuring accessible healthcare for all citizens of Santa Maria, particularly those in remote barangays who previously had to travel long distances for medical care.</p>`,
    excerpt:
      "A new health center in Barangay San Jose expands healthcare access with comprehensive medical services for southern district residents.",
    category: "post",
    status: "published",
    featured_image:
      "https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=1200",
    tags: ["healthcare", "health center", "barangay", "medical services"],
    author_id: 1,
    like_count: 56,
    love_count: 34,
    helpful_count: 89,
    view_count: 1450,
    comment_count: 18,
    created_at: "2024-01-08T09:15:00Z",
    updated_at: "2024-01-08T09:15:00Z",
    published_at: "2024-01-08T09:15:00Z",
    author_name: "Health Department",
  },
];

const mockComments: { [postId: number]: Comment[] } = {
  1: [
    {
      id: 1,
      post_id: 1,
      author_name: "Maria Santos",
      author_email: "maria@email.com",
      content:
        "This is wonderful! Finally, we can access services online. Thank you for this improvement.",
      status: "approved",
      created_at: "2024-01-15T10:30:00Z",
    },
    {
      id: 2,
      post_id: 1,
      author_name: "Juan Dela Cruz",
      author_email: "juan@email.com",
      content:
        "Great initiative! Will this include business permit renewals as well?",
      status: "approved",
      created_at: "2024-01-15T11:45:00Z",
    },
  ],
};

// API functions that would connect to your backend
export const api = {
  // Posts
  async getPosts(
    page = 1,
    limit = 10,
    category?: string,
    search?: string
  ): Promise<{ posts: Post[]; total: number }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (category) params.append("category", category);
      if (search) params.append("search", search);

      const response = await apiRequest<Post[]>(`/posts?${params}`);

      if (response.success && response.data) {
        return {
          posts: response.data,
          total: (response as any).pagination?.total || response.data.length,
        };
      }

      throw new Error(response.error || "Failed to fetch posts");
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      // Fallback to first few mock posts
      const filteredPosts = mockPosts.slice(0, 3);
      return { posts: filteredPosts, total: filteredPosts.length };
    }
  },

  async getPost(id: number): Promise<Post | null> {
    try {
      const response = await apiRequest<Post>(`/posts/${id}`);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.error || "Post not found");
    } catch (error) {
      console.error("Failed to fetch post:", error);
      // Fallback to mock data
      return mockPosts.find((post) => post.id === id) || null;
    }
  },

  async getPostBySlug(slug: string): Promise<Post | null> {
    try {
      // Get all posts and find by slug (could be optimized with a dedicated endpoint)
      const response = await apiRequest<Post[]>(`/posts?search=${slug}`);

      if (response.success && response.data) {
        const post = response.data.find((p) => p.slug === slug);
        return post || null;
      }

      throw new Error(response.error || "Post not found");
    } catch (error) {
      console.error("Failed to fetch post by slug:", error);
      // Fallback to mock data
      return mockPosts.find((post) => post.slug === slug) || null;
    }
  },

  // Comments
  async getComments(postId: number): Promise<Comment[]> {
    try {
      const response = await apiRequest<Comment[]>(
        `/comments?post_id=${postId}`
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.error || "Failed to fetch comments");
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      // Fallback to mock data
      return mockComments[postId] || [];
    }
  },

  async addComment(
    postId: number,
    comment: Omit<Comment, "id" | "post_id" | "created_at" | "status">
  ): Promise<Comment> {
    try {
      const response = await apiRequest<Comment>("/comments", {
        method: "POST",
        body: JSON.stringify({ post_id: postId, ...comment }),
      });

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.error || "Failed to add comment");
    } catch (error) {
      console.error("Failed to add comment:", error);

      // Fallback to mock behavior
      const newComment: Comment = {
        id: Date.now(),
        post_id: postId,
        ...comment,
        status: "approved",
        created_at: new Date().toISOString(),
      };

      if (!mockComments[postId]) {
        mockComments[postId] = [];
      }
      mockComments[postId].push(newComment);

      return newComment;
    }
  },

  // Reactions
  async getReactionCounts(postId: number): Promise<ReactionCounts> {
    try {
      const response = await apiRequest<ReactionCounts>(
        `/posts/${postId}/reactions`
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.error || "Failed to fetch reaction counts");
    } catch (error) {
      console.error("Failed to fetch reaction counts:", error);
      // Fallback to post data
      const post = mockPosts.find((p) => p.id === postId);
      return {
        like: post?.like_count || 0,
        love: post?.love_count || 0,
        helpful: post?.helpful_count || 0,
      };
    }
  },

  async addReaction(
    postId: number,
    reactionType: "like" | "love" | "helpful"
  ): Promise<ReactionCounts> {
    try {
      const response = await apiRequest<ReactionCounts>(
        `/posts/${postId}/reactions`,
        {
          method: "POST",
          body: JSON.stringify({ type: reactionType }),
        }
      );

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.error || "Failed to add reaction");
    } catch (error) {
      console.error("Failed to add reaction:", error);

      // Fallback to mock behavior
      const post = mockPosts.find((p) => p.id === postId);
      if (post) {
        switch (reactionType) {
          case "like":
            post.like_count++;
            break;
          case "love":
            post.love_count++;
            break;
          case "helpful":
            post.helpful_count++;
            break;
        }
      }

      return this.getReactionCounts(postId);
    }
  },

  // Search
  async searchPosts(query: string): Promise<Post[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return mockPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.content.toLowerCase().includes(query.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(query.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
    );
  },
};
