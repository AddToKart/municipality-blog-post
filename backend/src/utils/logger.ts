class ProductionLogger {
  private isDevelopment = process.env["NODE_ENV"] === "development";

  // Safe logging for production - removes sensitive data
  info(message: string): void {
    if (this.isDevelopment) {
      console.log(`ℹ️  ${message}`);
    }
  }

  // Only log errors in development, hide details in production
  error(message: string, error?: any): void {
    if (this.isDevelopment) {
      console.error(`❌ ${message}`, error);
    } else {
      // In production, log only safe information without details
      console.error(`❌ ${message}`);
    }
  }

  warn(message: string): void {
    console.warn(`⚠️  ${message}`);
  }

  // Server startup and system info - always log
  system(message: string): void {
    console.log(message);
  }
}

export const logger = new ProductionLogger();
export { ProductionLogger };
