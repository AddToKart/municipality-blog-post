import { Pool, PoolClient } from "pg";

let pool: Pool;

export const connectDB = async (): Promise<Pool> => {
  try {
    if (!pool) {
      // Use individual connection parameters for better compatibility
      const config = {
        host: process.env["DB_HOST"] || "localhost",
        port: parseInt(process.env["DB_PORT"] || "5432"),
        database: process.env["DB_NAME"] || "santa_maria_blog",
        user: process.env["DB_USER"] || "postgres",
        password: process.env["DB_PASSWORD"] || "123",
        ssl:
          process.env["NODE_ENV"] === "production"
            ? { rejectUnauthorized: false }
            : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      };

      pool = new Pool(config);

      // Test the connection
      const testResult = await pool.query("SELECT NOW()");
      console.log("✅ Database connected at:", testResult.rows[0]?.now);
    }

    return pool;
  } catch (error) {
    console.error("❌ Database connection error:", error);
    throw error;
  }
};

export const query = async <T = any>(
  text: string,
  params?: any[]
): Promise<T[]> => {
  let client: PoolClient | null = null;

  try {
    if (!pool) {
      throw new Error("Database pool not initialized");
    }

    client = await pool.connect();
    const result = await client.query(text, params);
    return result.rows as T[];
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
};

export const queryOne = async <T = any>(
  text: string,
  params?: any[]
): Promise<T | null> => {
  const results = await query<T>(text, params);
  return results.length > 0 ? results[0] ?? null : null;
};

export const getClient = async (): Promise<PoolClient> => {
  if (!pool) {
    throw new Error("Database pool not initialized");
  }
  return await pool.connect();
};

export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    console.log("🔌 Database pool closed");
  }
};

// Transaction helper
export const withTransaction = async <T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const client = await getClient();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
