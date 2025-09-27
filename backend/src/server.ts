import app from "./app";
import { connectDB, closePool } from "@/config/database";

const PORT = parseInt(process.env["PORT"] || "5000");

// Connect to database and start server
const startServer = async (): Promise<void> => {
  try {
    // Test database connection
    await connectDB();
    console.log("✅ Database connection established");

    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(
        `🌐 Environment: ${process.env["NODE_ENV"] || "development"}`
      );
      console.log(`📋 API Documentation: http://localhost:${PORT}/api`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
    });

    // Graceful shutdown handlers
    const gracefulShutdown = (signal: string) => {
      console.log(`🛑 ${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        console.log("🔒 HTTP server closed");

        try {
          await closePool();
          console.log("👋 Graceful shutdown completed");
          process.exit(0);
        } catch (error) {
          console.error("❌ Error during graceful shutdown:", error);
          process.exit(1);
        }
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error("❌ Forcing shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    // Handle uncaught exceptions
    process.on("uncaughtException", (error: Error) => {
      console.error("❌ Uncaught Exception:", error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on(
      "unhandledRejection",
      (reason: unknown, promise: Promise<unknown>) => {
        console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
        process.exit(1);
      }
    );
  } catch (error) {
    console.error("❌ Failed to start server:", (error as Error).message);
    process.exit(1);
  }
};

startServer();
