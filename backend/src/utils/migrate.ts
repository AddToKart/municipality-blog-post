import { query, connectDB } from "../config/database";

const createTables = async (): Promise<void> => {
  console.log("🔨 Creating database tables...");

  // Users table
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Posts table
  await query(`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      content TEXT NOT NULL,
      excerpt TEXT,
      category VARCHAR(50) NOT NULL CHECK (category IN ('post', 'announcement')),
      status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
      featured_image VARCHAR(500),
      tags TEXT[],
      author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      like_count INTEGER DEFAULT 0,
      love_count INTEGER DEFAULT 0,
      helpful_count INTEGER DEFAULT 0,
      view_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      published_at TIMESTAMP
    );
  `);

  // Comments table
  await query(`
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
      author_name VARCHAR(100) NOT NULL,
      author_email VARCHAR(100) NOT NULL,
      content TEXT NOT NULL,
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Reactions table
  await query(`
    CREATE TABLE IF NOT EXISTS reactions (
      id SERIAL PRIMARY KEY,
      post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
      reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('like', 'love', 'helpful')),
      ip_address INET NOT NULL,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(post_id, ip_address, reaction_type)
    );
  `);

  // Media table
  await query(`
    CREATE TABLE IF NOT EXISTS media (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type VARCHAR(100) NOT NULL,
      uploaded_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create indexes for better performance
  await query(
    `CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);`
  );
  await query(`CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);`);
  await query(
    `CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at);`
  );
  await query(
    `CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);`
  );
  await query(
    `CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);`
  );
  await query(
    `CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);`
  );
  await query(
    `CREATE INDEX IF NOT EXISTS idx_reactions_post_id ON reactions(post_id);`
  );

  // Create triggers for auto-updating timestamps
  await query(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  await query(`
    DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
    CREATE TRIGGER update_posts_updated_at 
      BEFORE UPDATE ON posts 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
  `);

  await query(`
    DROP TRIGGER IF EXISTS update_users_updated_at ON users;
    CREATE TRIGGER update_users_updated_at 
      BEFORE UPDATE ON users 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
  `);

  console.log("✅ Database tables created successfully");
};

const runMigration = async (): Promise<void> => {
  try {
    await connectDB();
    await createTables();
    console.log("🎉 Database migration completed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
};

runMigration();
