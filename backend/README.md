# Santa Maria Municipality Blog API - TypeScript Backend

A modern, type-safe Express.js API server for the Santa Maria Municipality blog system.

## 🚀 Features

- **TypeScript**: Full type safety throughout the application
- **Express.js**: Fast, minimalist web framework
- **PostgreSQL**: Reliable relational database with strong typing
- **JWT Authentication**: Secure admin authentication
- **File Upload**: Image and document upload with validation
- **Rate Limiting**: Protection against abuse
- **Security**: Helmet, CORS, input validation
- **Error Handling**: Comprehensive error handling with proper types
- **Path Aliases**: Clean imports with @ syntax

## 📁 Project Structure

```
src/
├── app.ts              # Express application setup
├── server.ts           # Server entry point
├── types/              # TypeScript type definitions
│   ├── api.ts          # API request/response types
│   ├── database.ts     # Database model types
│   └── index.ts        # Type exports
├── config/             # Configuration files
│   └── database.ts     # Database connection
├── middleware/         # Express middleware
│   ├── auth.ts         # Authentication middleware
│   ├── errorHandler.ts # Error handling
│   └── notFound.ts     # 404 handler
├── routes/             # API routes
│   ├── auth.ts         # Authentication endpoints
│   ├── posts.ts        # Posts CRUD operations
│   ├── comments.ts     # Comments management
│   ├── reactions.ts    # Reactions (like, love, helpful)
│   └── upload.ts       # File upload endpoints
├── controllers/        # Business logic (to be implemented)
├── models/             # Database models (to be implemented)
└── utils/              # Utility functions (to be implemented)
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

Copy the environment template:

```bash
copy .env.example .env
```

Update `.env` with your configuration:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/santa_maria_blog
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:5173
```

### 3. Setup PostgreSQL Database

Make sure PostgreSQL is running and create a database:

```sql
CREATE DATABASE santa_maria_blog;
```

### 4. Run Database Migrations (when implemented)

```bash
npm run migrate
```

### 5. Seed Database (when implemented)

```bash
npm run seed
```

### 6. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## 📋 API Endpoints

### Health & Info

- `GET /api/health` - Health check
- `GET /api` - API documentation

### Authentication

- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/me` - Get current user

### Posts

- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create post (admin)
- `PUT /api/posts/:id` - Update post (admin)
- `DELETE /api/posts/:id` - Delete post (admin)

### Comments

- `GET /api/comments/:postId` - Get post comments
- `POST /api/comments/:postId` - Add comment
- `DELETE /api/comments/:id` - Delete comment (admin)
- `PUT /api/comments/:id/status` - Update comment status (admin)

### Reactions

- `GET /api/reactions/:postId` - Get post reactions
- `POST /api/reactions/:postId` - Add/update reaction
- `DELETE /api/reactions/:postId/:type` - Remove reaction

### File Upload

- `POST /api/upload` - Upload file (admin)
- `GET /api/upload` - List files (admin)
- `DELETE /api/upload/:id` - Delete file (admin)

## 🔧 Development Scripts

```bash
npm run dev        # Start development server with watch mode
npm run build      # Build TypeScript to JavaScript
npm start          # Start production server
npm run migrate    # Run database migrations
npm run seed       # Seed database with initial data
npm test           # Run tests
npm run lint       # Check code style
npm run lint:fix   # Fix code style issues
```

## 🏗️ Next Steps

1. **Install Dependencies**: `npm install`
2. **Setup Database**: Configure PostgreSQL and run migrations
3. **Implement Controllers**: Add business logic for each endpoint
4. **Add Validation**: Implement request validation with Zod
5. **Setup File Upload**: Configure Multer for image/document uploads
6. **Add Tests**: Write unit and integration tests
7. **Deploy**: Configure for production deployment

## 🔐 Security Features

- **JWT Authentication**: Secure admin access
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Sanitize all inputs
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Controlled cross-origin access
- **Security Headers**: Helmet middleware
- **File Upload Validation**: Size and type restrictions

## 🎯 Type Safety

This backend is built with TypeScript for maximum type safety:

- **Shared Types**: Matching frontend interface definitions
- **Database Types**: Strongly typed database operations
- **API Types**: Type-safe request/response handling
- **Middleware Types**: Typed Express middleware
- **Error Types**: Structured error handling

The types ensure consistency between frontend and backend, catching errors at compile time rather than runtime.
