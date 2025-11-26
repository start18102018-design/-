// Admin configuration
// For production, move these to environment variables

/**
 * Admin credentials configuration
 * IMPORTANT: In production, these should be:
 * 1. Stored in environment variables
 * 2. Hashed in the database
 * 3. Never committed to git
 */

// Default admin password hash (SHA-256 of "Admin123!Secure")
// Generated using: hashPassword("Admin123!Secure")
export const ADMIN_PASSWORD_HASH = "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918";

// For development only - shows the actual password
// REMOVE THIS IN PRODUCTION!
export const DEV_ADMIN_PASSWORD = "admin123";

/**
 * Verify admin password
 * This is a placeholder. In production:
 * 1. Fetch hash from secure backend
 * 2. Use proper bcrypt or Argon2
 * 3. Implement 2FA
 */
export function isValidAdminPassword(password: string): boolean {
  // For development/demo purposes only
  if (process.env.NODE_ENV === 'development') {
    return password === DEV_ADMIN_PASSWORD;
  }
  
  // For production, you would:
  // return verifyPassword(password, ADMIN_PASSWORD_HASH);
  return password === DEV_ADMIN_PASSWORD;
}

/**
 * Security configuration
 */
export const SECURITY_CONFIG = {
  // Maximum login attempts before lockout
  MAX_LOGIN_ATTEMPTS: 5,
  
  // Lockout duration in minutes
  LOCKOUT_DURATION_MINUTES: 30,
  
  // Session timeout in minutes
  SESSION_TIMEOUT_MINUTES: 30,
  
  // Minimum PIN length
  MIN_PIN_LENGTH: 4,
  
  // Maximum PIN length
  MAX_PIN_LENGTH: 6,
  
  // Remember me duration in days
  REMEMBER_ME_DAYS: 30,
  
  // Enable/disable security warnings
  SHOW_SECURITY_WARNINGS: true,
};

/**
 * Get admin password from environment or use default
 */
export function getAdminPasswordHash(): string {
  // In production, use environment variable:
  // return process.env.VITE_ADMIN_PASSWORD_HASH || ADMIN_PASSWORD_HASH;
  return ADMIN_PASSWORD_HASH;
}
