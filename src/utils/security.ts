// Security utilities for password hashing and validation

/**
 * Hash a password using SHA-256
 * @param password - Plain text password
 * @returns Hashed password as hex string
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Verify a password against a hash
 * @param password - Plain text password to verify
 * @param hash - Stored hash to compare against
 * @returns True if password matches hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * Sanitize user input to prevent XSS attacks
 * @param input - User input string
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Validate PIN code format
 * @param pin - PIN code to validate
 * @returns True if valid
 */
export function isValidPinCode(pin: string): boolean {
  return /^\d{4}$|^\d{6}$/.test(pin);
}

/**
 * Generate a secure random token
 * @param length - Length of token
 * @returns Random hex string
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Check if connection is secure (HTTPS)
 * @returns True if connection is secure
 */
export function isSecureConnection(): boolean {
  return window.location.protocol === 'https:' || window.location.hostname === 'localhost';
}

/**
 * Rate limiter for login attempts
 */
export class RateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;
  private readonly lockoutMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000, lockoutMs: number = 30 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.lockoutMs = lockoutMs;
  }

  /**
   * Check if an identifier is rate limited
   * @param identifier - Unique identifier (e.g., phone number)
   * @returns Object with isLocked status and remaining time
   */
  checkLimit(identifier: string): { isLocked: boolean; remainingTime?: number } {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record) {
      return { isLocked: false };
    }

    // Check if lockout period has expired
    if (record.count >= this.maxAttempts) {
      const timeSinceLockout = now - record.lastAttempt;
      if (timeSinceLockout < this.lockoutMs) {
        const remainingTime = Math.ceil((this.lockoutMs - timeSinceLockout) / 1000 / 60);
        return { isLocked: true, remainingTime };
      } else {
        // Lockout expired, reset
        this.attempts.delete(identifier);
        return { isLocked: false };
      }
    }

    // Check if window has expired
    const timeSinceFirstAttempt = now - record.lastAttempt;
    if (timeSinceFirstAttempt > this.windowMs) {
      this.attempts.delete(identifier);
      return { isLocked: false };
    }

    return { isLocked: false };
  }

  /**
   * Record a failed attempt
   * @param identifier - Unique identifier
   */
  recordAttempt(identifier: string): void {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
    } else {
      const timeSinceLastAttempt = now - record.lastAttempt;
      
      if (timeSinceLastAttempt > this.windowMs) {
        // Reset if window expired
        this.attempts.set(identifier, { count: 1, lastAttempt: now });
      } else {
        // Increment count
        record.count++;
        record.lastAttempt = now;
      }
    }
  }

  /**
   * Reset attempts for an identifier (e.g., after successful login)
   * @param identifier - Unique identifier
   */
  resetAttempts(identifier: string): void {
    this.attempts.delete(identifier);
  }

  /**
   * Get remaining attempts before lockout
   * @param identifier - Unique identifier
   * @returns Number of remaining attempts
   */
  getRemainingAttempts(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record) return this.maxAttempts;
    return Math.max(0, this.maxAttempts - record.count);
  }
}

/**
 * Session timeout manager
 */
export class SessionTimeout {
  private timeoutId: number | null = null;
  private lastActivity: number = Date.now();
  private readonly timeoutMs: number;
  private onTimeout: () => void;

  constructor(timeoutMinutes: number = 30, onTimeout: () => void) {
    this.timeoutMs = timeoutMinutes * 60 * 1000;
    this.onTimeout = onTimeout;
    this.startTimeout();
    this.setupActivityListeners();
  }

  private startTimeout(): void {
    this.clearTimeout();
    this.timeoutId = window.setTimeout(() => {
      this.onTimeout();
    }, this.timeoutMs);
  }

  private clearTimeout(): void {
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private resetTimeout(): void {
    this.lastActivity = Date.now();
    this.startTimeout();
  }

  private setupActivityListeners(): void {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, () => this.resetTimeout(), { passive: true });
    });
  }

  destroy(): void {
    this.clearTimeout();
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.removeEventListener(event, () => this.resetTimeout());
    });
  }

  getRemainingTime(): number {
    const elapsed = Date.now() - this.lastActivity;
    return Math.max(0, this.timeoutMs - elapsed);
  }
}
