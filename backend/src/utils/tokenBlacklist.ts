/**
 * Token Blacklist Service
 *
 * Maintains a blacklist of invalidated JWT tokens.
 * In production, this should be replaced with Redis for scalability.
 */

class TokenBlacklistService {
  private blacklist: Map<string, number> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired tokens every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000);
  }

  /**
   * Add a token to the blacklist
   * @param token - JWT token to blacklist
   * @param expiresAt - Unix timestamp when the token expires
   */
  blacklistToken(token: string, expiresAt: number): void {
    this.blacklist.set(token, expiresAt);
  }

  /**
   * Check if a token is blacklisted
   * @param token - JWT token to check
   * @returns true if token is blacklisted
   */
  isBlacklisted(token: string): boolean {
    const expiresAt = this.blacklist.get(token);

    if (!expiresAt) {
      return false;
    }

    // If token has expired, remove it from blacklist
    if (Date.now() > expiresAt) {
      this.blacklist.delete(token);
      return false;
    }

    return true;
  }

  /**
   * Remove expired tokens from the blacklist
   */
  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    this.blacklist.forEach((expiresAt, token) => {
      if (now > expiresAt) {
        toDelete.push(token);
      }
    });

    toDelete.forEach((token) => this.blacklist.delete(token));
  }

  /**
   * Get the number of blacklisted tokens (for monitoring)
   */
  getBlacklistSize(): number {
    return this.blacklist.size;
  }

  /**
   * Clear all tokens (use with caution - mainly for testing)
   */
  clearAll(): void {
    this.blacklist.clear();
  }

  /**
   * Stop the cleanup interval (call when shutting down)
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
  }
}

// Singleton instance
export const tokenBlacklist = new TokenBlacklistService();
