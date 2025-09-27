# Santa Maria Municipality Blog System Blueprint

## 📋 Project Overview

A modern blog posting system for Santa Maria Municipality featuring:
- **Single Admin Interface**: Secure admin panel for managing content
- **Public Viewing**: Anyone can view posts and announcements
- **Engagement Features**: Public reactions and comments
- **Responsive Design**: Works on all devices

---

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (Express.js)  │◄──►│  (PostgreSQL)   │
│                 │    │                 │    │                 │
│ - Admin Panel   │    │ - REST API      │    │ - Posts         │
│ - Public Pages  │    │ - Authentication│    │ - Users         │
│ - Responsive UI │    │ - File Upload   │    │ - Comments      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🎨 Frontend Structure (Next.js + TailwindCSS + ShadCN/UI)

### Project Structure
```
santa-maria-blog/
├── app/
│   ├── (admin)/
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── posts/
│   │   │   ├── announcements/
│   │   │   └── settings/
│   │   └── login/
│   ├── (public)/
│   │   ├── page.tsx (Homepage)
│   │   ├── posts/
│   │   ├── announcements/
│   │   └── about/
│   ├── api/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/ (ShadCN components)
│   ├── admin/
│   │   ├── AdminLayout.tsx
│   │   ├── PostEditor.tsx
│   │   ├── PostList.tsx
│   │   └── Dashboard.tsx
│   ├── public/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── PostCard.tsx
│   │   ├── CommentSection.tsx
│   │   └── ReactionButtons.tsx
│   └── shared/
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   └── utils.ts
├── types/
└── public/
```

### Key Pages & Components

#### Admin Interface
- **Login Page**: Secure authentication
- **Dashboard**: Overview of posts, announcements, analytics
- **Post Management**: Create, edit, delete posts
- **Announcement Management**: Manage urgent announcements
- **Media Library**: Upload and manage images/files

#### Public Interface
- **Homepage**: Latest posts and announcements
- **Posts Archive**: Paginated list of all posts
- **Post Detail**: Individual post with comments and reactions
- **About Municipality**: Information about Santa Maria

---

## ⚙️ Backend Structure (Express.js)

### Project Structure
```
santa-maria-api/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── postController.js
│   │   ├── commentController.js
│   │   └── reactionController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── upload.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Comment.js
│   │   └── Reaction.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── posts.js
│   │   ├── comments.js
│   │   └── reactions.js
│   ├── utils/
│   │   ├── database.js
│   │   ├── helpers.js
│   │   └── constants.js
│   ├── config/
│   │   └── database.js
│   ├── migrations/
│   └── seeders/
│   └── app.js
├── uploads/ (for images/files)
├── .env
└── server.js
```

### API Endpoints

#### Authentication
```
POST /api/auth/login       - Admin login
POST /api/auth/logout      - Admin logout
GET  /api/auth/me          - Get current admin user
```

#### Posts Management
```
GET    /api/posts          - Get all posts (public)
GET    /api/posts/:id      - Get single post (public)
POST   /api/posts          - Create new post (admin only)
PUT    /api/posts/:id      - Update post (admin only)
DELETE /api/posts/:id      - Delete post (admin only)
```

#### Comments
```
GET    /api/posts/:id/comments     - Get post comments
POST   /api/posts/:id/comments     - Add comment (public)
DELETE /api/comments/:id           - Delete comment (admin only)
```

#### Reactions
```
GET    /api/posts/:id/reactions    - Get post reactions
POST   /api/posts/:id/reactions    - Add/update reaction (public)
```

#### File Upload
```
POST   /api/upload                 - Upload images/files (admin only)
```

---

## 🗄️ Database Schema (PostgreSQL)

### Database Tables

#### users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- hashed
  role VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### posts Table
```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category VARCHAR(50) NOT NULL, -- 'post' | 'announcement'
  status VARCHAR(20) DEFAULT 'draft', -- 'draft' | 'published'
  featured_image VARCHAR(500),
  tags TEXT[], -- PostgreSQL array type
  author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  like_count INTEGER DEFAULT 0,
  love_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_published_at ON posts(published_at);
CREATE INDEX idx_posts_author ON posts(author_id);
```

#### comments Table
```sql
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  author_name VARCHAR(100) NOT NULL,
  author_email VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster comment retrieval
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_status ON comments(status);
```

#### reactions Table
```sql
CREATE TABLE reactions (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) NOT NULL, -- 'like' | 'love' | 'helpful'
  ip_address INET NOT NULL, -- PostgreSQL IP address type
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Prevent duplicate reactions from same IP
  UNIQUE(post_id, ip_address, reaction_type)
);

-- Index for reaction queries
CREATE INDEX idx_reactions_post_id ON reactions(post_id);
```

#### media Table (for file management)
```sql
CREATE TABLE media (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  uploaded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Database Triggers (Auto-update timestamps)
```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$ language 'plpgsql';

-- Apply trigger to posts table
CREATE TRIGGER update_posts_updated_at 
  BEFORE UPDATE ON posts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to users table
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

### Views for Complex Queries
```sql
-- View for posts with reaction counts
CREATE VIEW posts_with_stats AS
SELECT 
  p.*,
  COALESCE(r.like_count, 0) as current_like_count,
  COALESCE(r.love_count, 0) as current_love_count,
  COALESCE(r.helpful_count, 0) as current_helpful_count,
  COALESCE(c.comment_count, 0) as comment_count
FROM posts p
LEFT JOIN (
  SELECT 
    post_id,
    COUNT(CASE WHEN reaction_type = 'like' THEN 1 END) as like_count,
    COUNT(CASE WHEN reaction_type = 'love' THEN 1 END) as love_count,
    COUNT(CASE WHEN reaction_type = 'helpful' THEN 1 END) as helpful_count
  FROM reactions 
  GROUP BY post_id
) r ON p.id = r.post_id
LEFT JOIN (
  SELECT post_id, COUNT(*) as comment_count
  FROM comments 
  WHERE status = 'approved'
  GROUP BY post_id
) c ON p.id = c.post_id;
```

---

## 🔒 Security Features

### Authentication & Authorization
- JWT-based admin authentication
- Password hashing with bcrypt
- Protected admin routes
- Session management

### Data Protection
- Input validation and sanitization
- XSS prevention
- CSRF protection
- Rate limiting for public endpoints
- File upload restrictions

### Privacy
- IP-based reaction tracking (no personal data)
- Optional comment moderation
- GDPR-friendly data handling

---

## 🎯 Key Features

### Admin Features
- **Rich Text Editor**: WYSIWYG editor for posts
- **Media Management**: Upload and organize images
- **Content Scheduling**: Schedule posts for future publication
- **Analytics Dashboard**: View post performance
- **Comment Moderation**: Approve/reject comments
- **SEO Tools**: Meta descriptions, tags, URLs

### Public Features
- **Responsive Design**: Mobile-first approach
- **Search Functionality**: Search posts and announcements
- **Social Sharing**: Share posts on social media
- **RSS Feed**: Subscribe to updates
- **Print-Friendly**: Clean print layouts
- **Accessibility**: WCAG compliant

### Performance Features
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: Improved page load times
- **Caching**: Redis for frequently accessed data
- **CDN Integration**: Fast global content delivery

---

## 📱 Responsive Design

### Breakpoints (TailwindCSS)
- **Mobile**: 320px - 768px
- **Tablet**: 769px - 1024px
- **Desktop**: 1025px+

### Key UI Components (ShadCN/UI)
- Button, Input, Textarea
- Card, Badge, Alert
- Dialog, Sheet, Popover
- Table, Pagination
- Form components
- Navigation components

---

## 🚀 Deployment Strategy

### Frontend (Vercel/Netlify)
```bash
# Build command
npm run build

# Environment variables
NEXT_PUBLIC_API_URL=https://api.santamaria.gov.ph
NEXT_PUBLIC_SITE_URL=https://news.santamaria.gov.ph
```

### Backend (Railway/Heroku/DigitalOcean)
```bash
# Environment variables
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/santamaria_blog
JWT_SECRET=your-secret-key
UPLOAD_PATH=/uploads
MAX_FILE_SIZE=5MB
```

### Database
- **PostgreSQL** (local) or **Supabase/Neon** (cloud)
- Regular backups with pg_dump
- Connection pooling for high availability
- Read replicas for scaling

---

## 📊 Monitoring & Analytics

### Performance Monitoring
- Server response times
- Database query performance
- Frontend Core Web Vitals

### Content Analytics
- Most viewed posts
- Popular categories
- User engagement metrics
- Comment activity

### System Health
- Uptime monitoring
- Error tracking
- Resource usage

---

## 🔧 Development Workflow

### Phase 1: Setup & Core Features (2-3 weeks)
1. Project initialization
2. Database setup
3. Authentication system
4. Basic CRUD operations
5. Admin interface

### Phase 2: Public Interface (2 weeks)
1. Public pages design
2. Post viewing functionality
3. Comment system
4. Reaction system

### Phase 3: Enhancement (1-2 weeks)
1. File upload system
2. Search functionality
3. Performance optimization
4. Testing & debugging

### Phase 4: Deployment (1 week)
1. Production setup
2. Domain configuration
3. SSL certificates
4. Monitoring setup

---

## 💻 Technology Stack Summary

### Frontend
- **Next.js 14**: React framework with App Router
- **TailwindCSS**: Utility-first CSS framework
- **ShadCN/UI**: High-quality React components
- **TypeScript**: Type safety
- **React Hook Form**: Form management
- **Zod**: Schema validation

### Backend
- **Express.js**: Web framework
- **PostgreSQL**: Relational database
- **Sequelize** or **Prisma**: PostgreSQL ORM
- **JWT**: Authentication
- **Multer**: File uploads
- **Helmet**: Security headers
- **Morgan**: Request logging
- **pg**: PostgreSQL client

### DevOps
- **Git**: Version control
- **ESLint + Prettier**: Code formatting
- **Jest**: Testing framework
- **Docker**: Containerization (optional)

---

## 📝 Next Steps

1. **Setup Development Environment**
   - Initialize Next.js project with TailwindCSS
   - Setup Express.js backend
   - Configure MongoDB connection

2. **Install Dependencies**
   - Frontend: Next.js, TailwindCSS, ShadCN/UI, React Hook Form
   - Backend: Express, Sequelize/Prisma, JWT, Multer, bcrypt, pg

3. **Start with Core Features**
   - Setup PostgreSQL database
   - Admin authentication
   - Basic post CRUD operations
   - Database migrations and seeders

4. **Iterate and Expand**
   - Add public interface
   - Implement engagement features
   - Optimize database queries
   - Add caching with Redis

This blueprint provides a solid foundation for building a modern, scalable blog system for Santa Maria Municipality. The architecture is flexible and can be extended with additional features as needed.