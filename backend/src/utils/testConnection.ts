import { Pool } from "pg";

const testConnection = async () => {
  try {
    console.log("Testing PostgreSQL connection...");

    const pool = new Pool({
      host: "localhost",
      port: 5432,
      database: "santa_maria_blog",
      user: "postgres",
      password: "123",
    });

    const result = await pool.query("SELECT NOW()");
    console.log("✅ Connection successful!", result.rows[0]);

    await pool.end();
  } catch (error) {
    console.error("❌ Connection failed:", error);

    // Try with different authentication
    try {
      console.log("Trying with trust authentication...");
      const pool2 = new Pool({
        host: "localhost",
        port: 5432,
        database: "santa_maria_blog",
        user: "postgres",
        // No password for trust auth
      });

      const result2 = await pool2.query("SELECT NOW()");
      console.log("✅ Trust auth successful!", result2.rows[0]);

      await pool2.end();
    } catch (error2) {
      console.error("❌ Trust auth also failed:", error2);
    }
  }
};

testConnection();
