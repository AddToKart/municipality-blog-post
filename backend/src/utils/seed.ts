import bcrypt from "bcryptjs";
import { query, connectDB } from "../config/database";

const seedData = async (): Promise<void> => {
  console.log("🌱 Seeding database with initial data...");

  // Check if admin user already exists
  const existingUser = await query("SELECT id FROM users WHERE email = $1", [
    process.env["DEFAULT_ADMIN_EMAIL"] || "admin@santamaria.gov.ph",
  ]);

  if (existingUser.length > 0) {
    console.log("👤 Admin user already exists, skipping user creation");
  } else {
    // Create default admin user
    const hashedPassword = await bcrypt.hash(
      process.env["DEFAULT_ADMIN_PASSWORD"] || "admin123",
      12
    );

    await query(
      `
      INSERT INTO users (username, email, password, role)
      VALUES ($1, $2, $3, $4)
    `,
      [
        process.env["DEFAULT_ADMIN_USERNAME"] || "admin",
        process.env["DEFAULT_ADMIN_EMAIL"] || "admin@santamaria.gov.ph",
        hashedPassword,
        "admin",
      ]
    );

    console.log("👤 Default admin user created");
    console.log(
      `   Email: ${
        process.env["DEFAULT_ADMIN_EMAIL"] || "admin@santamaria.gov.ph"
      }`
    );
    console.log(
      `   Password: ${process.env["DEFAULT_ADMIN_PASSWORD"] || "admin123"}`
    );
  }

  // Add some sample posts for testing
  const samplePosts = [
    {
      title: "Welcome to Santa Maria Municipality Blog",
      slug: "welcome-to-santa-maria-blog",
      content: `<p>We are excited to launch our official municipality blog where we will share important announcements, news, and updates about our community.</p>

<p>This platform will serve as your primary source for:</p>
<ul>
<li>Municipal announcements and updates</li>
<li>Community events and programs</li>
<li>Public service information</li>
<li>Local government initiatives</li>
</ul>

<p>Stay connected with us and be part of our growing community!</p>`,
      excerpt:
        "Welcome to the official Santa Maria Municipality blog - your source for community news and announcements.",
      category: "announcement",
      status: "published",
    },
    {
      title: "New Public Health Guidelines Implemented",
      slug: "new-public-health-guidelines",
      content: `<p>The Municipality of Santa Maria has implemented new public health guidelines to ensure the safety and well-being of our residents.</p>

<p><strong>Key Guidelines:</strong></p>
<ul>
<li>Maintain proper hygiene in public spaces</li>
<li>Follow traffic and safety protocols</li>
<li>Participate in community health programs</li>
</ul>

<p>For more information, please visit our municipal office or contact us through our official channels.</p>`,
      excerpt:
        "New public health guidelines have been implemented for the safety of all Santa Maria residents.",
      category: "post",
      status: "published",
    },
  ];

  // Get the admin user ID
  const adminUser = await query(
    "SELECT id FROM users WHERE role = $1 LIMIT 1",
    ["admin"]
  );

  if (adminUser.length > 0) {
    const adminId = adminUser[0].id;

    for (const post of samplePosts) {
      // Check if post already exists
      const existingPost = await query("SELECT id FROM posts WHERE slug = $1", [
        post.slug,
      ]);

      if (existingPost.length === 0) {
        await query(
          `
          INSERT INTO posts (title, slug, content, excerpt, category, status, author_id, published_at, tags)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,
          [
            post.title,
            post.slug,
            post.content,
            post.excerpt,
            post.category,
            post.status,
            adminId,
            new Date().toISOString(),
            ["announcement", "welcome"],
          ]
        );

        console.log(`📄 Created sample post: ${post.title}`);
      }
    }
  }

  console.log("✅ Database seeded successfully");
};

const runSeed = async (): Promise<void> => {
  try {
    await connectDB();
    await seedData();
    console.log("🎉 Database seeding completed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

runSeed();
