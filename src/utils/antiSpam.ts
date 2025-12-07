// Anti-spam and advanced rate limiting utilities

/**
 * Action types for different rate limits
 */
export enum ActionType {
  LOGIN = 'login',
  REGISTRATION = 'registration',
  PASSWORD_RESET = 'password_reset',
  METER_SUBMISSION = 'meter_submission',
  REQUEST_SUBMISSION = 'request_submission',
  PAYMENT = 'payment',
  ADMIN_LOGIN = 'admin_login',
  FORM_SUBMISSION = 'form_submission',
  API_CALL = 'api_call'
}

/**
 * Rate limit configuration per action type
 */
interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  lockoutMs?: number;
}

const RATE_LIMIT_CONFIGS: Record<ActionType, RateLimitConfig> = {
  [ActionType.LOGIN]: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    lockoutMs: 30 * 60 * 1000  // 30 minutes
  },
  [ActionType.REGISTRATION]: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000,  // 1 hour
    lockoutMs: 2 * 60 * 60 * 1000 // 2 hours
  },
  [ActionType.PASSWORD_RESET]: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000,  // 1 hour
    lockoutMs: 60 * 60 * 1000  // 1 hour
  },
  [ActionType.METER_SUBMISSION]: {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000,  // 1 hour (max 5 submissions per hour)
  },
  [ActionType.REQUEST_SUBMISSION]: {
    maxAttempts: 10,
    windowMs: 24 * 60 * 60 * 1000, // 24 hours (max 10 requests per day)
  },
  [ActionType.PAYMENT]: {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000,  // 1 hour
    lockoutMs: 2 * 60 * 60 * 1000 // 2 hours
  },
  [ActionType.ADMIN_LOGIN]: {
    maxAttempts: 5,  // Increased from 3 to 5 for easier development
    windowMs: 15 * 60 * 1000,  // 15 minutes
    lockoutMs: 30 * 60 * 1000  // 30 minutes (reduced from 1 hour)
  },
  [ActionType.FORM_SUBMISSION]: {
    maxAttempts: 20,
    windowMs: 60 * 1000,  // 1 minute (max 20 per minute)
  },
  [ActionType.API_CALL]: {
    maxAttempts: 60,
    windowMs: 60 * 1000,  // 1 minute (max 60 per minute)
  }
};

/**
 * Attempt record
 */
interface AttemptRecord {
  count: number;
  timestamps: number[];
  firstAttempt: number;
  lastAttempt: number;
  isLocked: boolean;
}

/**
 * Advanced Rate Limiter with multiple action types
 */
export class AdvancedRateLimiter {
  private attempts: Map<string, AttemptRecord> = new Map();
  
  /**
   * Get unique key for identifier and action
   */
  private getKey(identifier: string, action: ActionType): string {
    return `${action}:${identifier}`;
  }
  
  /**
   * Check if action is rate limited
   */
  checkLimit(identifier: string, action: ActionType): {
    allowed: boolean;
    remainingAttempts: number;
    resetTime?: number;
    lockoutTime?: number;
    message?: string;
  } {
    const key = this.getKey(identifier, action);
    const config = RATE_LIMIT_CONFIGS[action];
    const now = Date.now();
    const record = this.attempts.get(key);
    
    if (!record) {
      return {
        allowed: true,
        remainingAttempts: config.maxAttempts
      };
    }
    
    // Check if locked out
    if (record.isLocked && config.lockoutMs) {
      const timeSinceLockout = now - record.lastAttempt;
      if (timeSinceLockout < config.lockoutMs) {
        const lockoutTime = Math.ceil((config.lockoutMs - timeSinceLockout) / 1000);
        return {
          allowed: false,
          remainingAttempts: 0,
          lockoutTime,
          message: `Действие заблокировано. Попробуйте через ${Math.ceil(lockoutTime / 60)} мин.`
        };
      } else {
        // Lockout expired
        this.attempts.delete(key);
        return {
          allowed: true,
          remainingAttempts: config.maxAttempts
        };
      }
    }
    
    // Clean old timestamps outside the window
    const validTimestamps = record.timestamps.filter(
      timestamp => now - timestamp < config.windowMs
    );
    
    if (validTimestamps.length === 0) {
      // All attempts expired
      this.attempts.delete(key);
      return {
        allowed: true,
        remainingAttempts: config.maxAttempts
      };
    }
    
    // Update record with valid timestamps
    record.timestamps = validTimestamps;
    record.count = validTimestamps.length;
    
    // Check if limit exceeded
    if (record.count >= config.maxAttempts) {
      const resetTime = Math.ceil((config.windowMs - (now - validTimestamps[0])) / 1000);
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime,
        message: `Превышен лимит попыток. Попробуйте через ${Math.ceil(resetTime / 60)} мин.`
      };
    }
    
    return {
      allowed: true,
      remainingAttempts: config.maxAttempts - record.count
    };
  }
  
  /**
   * Record an attempt
   */
  recordAttempt(identifier: string, action: ActionType, success: boolean = false): void {
    const key = this.getKey(identifier, action);
    const config = RATE_LIMIT_CONFIGS[action];
    const now = Date.now();
    
    if (success) {
      // Reset on success
      this.attempts.delete(key);
      return;
    }
    
    const record = this.attempts.get(key);
    
    if (!record) {
      this.attempts.set(key, {
        count: 1,
        timestamps: [now],
        firstAttempt: now,
        lastAttempt: now,
        isLocked: false
      });
    } else {
      record.timestamps.push(now);
      record.count++;
      record.lastAttempt = now;
      
      // Check if should lock
      if (record.count >= config.maxAttempts && config.lockoutMs) {
        record.isLocked = true;
      }
    }
    
    // Log suspicious activity (only in development mode)
    if (record && record.count >= config.maxAttempts - 1) {
      if (process.env.NODE_ENV === 'production') {
        console.warn(`[SECURITY] Suspicious activity detected: ${action} for ${identifier}`);
      } else {
        console.log(`[DEV] Rate limit warning: ${action} for ${identifier} - ${record.count}/${config.maxAttempts} attempts`);
      }
    }
  }
  
  /**
   * Reset attempts for identifier
   */
  reset(identifier: string, action: ActionType): void {
    const key = this.getKey(identifier, action);
    this.attempts.delete(key);
  }
  
  /**
   * Get attempt statistics
   */
  getStats(identifier: string, action: ActionType): {
    totalAttempts: number;
    remainingAttempts: number;
    firstAttempt?: Date;
    lastAttempt?: Date;
    isLocked: boolean;
  } {
    const key = this.getKey(identifier, action);
    const config = RATE_LIMIT_CONFIGS[action];
    const record = this.attempts.get(key);
    
    if (!record) {
      return {
        totalAttempts: 0,
        remainingAttempts: config.maxAttempts,
        isLocked: false
      };
    }
    
    return {
      totalAttempts: record.count,
      remainingAttempts: Math.max(0, config.maxAttempts - record.count),
      firstAttempt: new Date(record.firstAttempt),
      lastAttempt: new Date(record.lastAttempt),
      isLocked: record.isLocked
    };
  }
  
  /**
   * Clean up old records (call periodically)
   */
  cleanup(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const [key, record] of this.attempts.entries()) {
      if (now - record.lastAttempt > maxAge) {
        this.attempts.delete(key);
      }
    }
  }
}

/**
 * Spam detection based on patterns
 */
export class SpamDetector {
  private submissions: Map<string, string[]> = new Map();
  
  /**
   * Check if content looks like spam
   */
  isSpam(content: string, identifier: string): {
    isSpam: boolean;
    reason?: string;
    confidence: number;
  } {
    const reasons: string[] = [];
    let spamScore = 0;
    
    // Check 1: Too many URLs
    const urlMatches = content.match(/https?:\/\/[^\s]+/gi) || [];
    if (urlMatches.length > 3) {
      spamScore += 30;
      reasons.push('Слишком много ссылок');
    }
    
    // Check 2: Repeated characters (aaaaaa, !!!!!!)
    const repeatedChars = content.match(/(.)\1{5,}/g);
    if (repeatedChars && repeatedChars.length > 0) {
      spamScore += 20;
      reasons.push('Повторяющиеся символы');
    }
    
    // Check 3: All caps (more than 70%)
    const capsRatio = (content.match(/[A-ZА-Я]/g) || []).length / content.length;
    if (capsRatio > 0.7 && content.length > 10) {
      spamScore += 15;
      reasons.push('Слишком много заглавных букв');
    }
    
    // Check 4: Too many special characters
    const specialChars = content.match(/[!@#$%^&*()_+={}\[\]:;"'<>,.?\/\\|`~]/g) || [];
    if (specialChars.length / content.length > 0.3) {
      spamScore += 20;
      reasons.push('Слишком много спецсимволов');
    }
    
    // Check 5: Too short or too long
    if (content.length < 3) {
      spamScore += 25;
      reasons.push('Слишком короткое сообщение');
    } else if (content.length > 5000) {
      spamScore += 15;
      reasons.push('Слишком длинное сообщение');
    }
    
    // Check 6: Duplicate content from same user
    const userHistory = this.submissions.get(identifier) || [];
    if (userHistory.includes(content)) {
      spamScore += 40;
      reasons.push('Дубликат сообщения');
    }
    
    // Check 7: Spam keywords
    const spamKeywords = [
      'виагра', 'казино', 'lottery', 'winner', 'prize',
      'click here', 'free money', 'заработок', 'кредит',
      'быстрый займ', 'работа на дому'
    ];
    const lowercaseContent = content.toLowerCase();
    const foundKeywords = spamKeywords.filter(keyword => 
      lowercaseContent.includes(keyword.toLowerCase())
    );
    if (foundKeywords.length > 0) {
      spamScore += foundKeywords.length * 25;
      reasons.push('Спам-ключевые слова');
    }
    
    // Store submission for duplicate detection
    if (!userHistory.includes(content)) {
      userHistory.push(content);
      // Keep only last 10 submissions
      if (userHistory.length > 10) {
        userHistory.shift();
      }
      this.submissions.set(identifier, userHistory);
    }
    
    const isSpam = spamScore >= 50;
    
    return {
      isSpam,
      reason: reasons.join(', '),
      confidence: Math.min(100, spamScore)
    };
  }
  
  /**
   * Clear history for identifier
   */
  clearHistory(identifier: string): void {
    this.submissions.delete(identifier);
  }
}

/**
 * Honeypot field for bot detection
 */
export function createHoneypot(): {
  fieldName: string;
  isBot: (value: any) => boolean;
} {
  const fieldName = `field_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    fieldName,
    isBot: (value: any) => {
      // If honeypot field is filled, it's a bot
      return value !== '' && value !== null && value !== undefined;
    }
  };
}

/**
 * Simple CAPTCHA for demo (not production-ready)
 */
export class SimpleCaptcha {
  private solution: number;
  private challenge: string;
  
  constructor() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    this.challenge = `${num1} ${operation} ${num2}`;
    
    switch (operation) {
      case '+':
        this.solution = num1 + num2;
        break;
      case '-':
        this.solution = num1 - num2;
        break;
      case '*':
        this.solution = num1 * num2;
        break;
      default:
        this.solution = num1 + num2;
    }
  }
  
  getChallenge(): string {
    return this.challenge;
  }
  
  verify(answer: string | number): boolean {
    const numAnswer = typeof answer === 'string' ? parseInt(answer, 10) : answer;
    return numAnswer === this.solution;
  }
  
  getSolution(): number {
    return this.solution;
  }
}

/**
 * Debounce utility for form submissions
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = window.setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, waitMs);
  };
}

/**
 * Throttle utility for preventing spam clicks
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limitMs: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return function(...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastCall >= limitMs) {
      lastCall = now;
      func(...args);
    }
  };
}

/**
 * IP-based rate limiting (simulated for client-side)
 * In production, this should be server-side
 */
export class IPRateLimiter {
  private ipAttempts: Map<string, number[]> = new Map();
  private readonly maxRequestsPerMinute = 60;
  
  /**
   * Get simulated IP address (in production use real IP from server)
   */
  private getSimulatedIP(): string {
    // Use browser fingerprint as pseudo-IP
    let fingerprint = localStorage.getItem('browser_fingerprint');
    if (!fingerprint) {
      fingerprint = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('browser_fingerprint', fingerprint);
    }
    return fingerprint;
  }
  
  /**
   * Check if IP is rate limited
   */
  checkIP(): { allowed: boolean; message?: string } {
    const ip = this.getSimulatedIP();
    const now = Date.now();
    const timestamps = this.ipAttempts.get(ip) || [];
    
    // Filter timestamps from last minute
    const recentTimestamps = timestamps.filter(
      timestamp => now - timestamp < 60 * 1000
    );
    
    if (recentTimestamps.length >= this.maxRequestsPerMinute) {
      return {
        allowed: false,
        message: 'Слишком много запросов. Пожалуйста, подождите минуту.'
      };
    }
    
    return { allowed: true };
  }
  
  /**
   * Record request from IP
   */
  recordRequest(): void {
    const ip = this.getSimulatedIP();
    const now = Date.now();
    const timestamps = this.ipAttempts.get(ip) || [];
    
    timestamps.push(now);
    
    // Keep only last minute
    const recentTimestamps = timestamps.filter(
      timestamp => now - timestamp < 60 * 1000
    );
    
    this.ipAttempts.set(ip, recentTimestamps);
  }
}

/**
 * Global instances
 */
export const rateLimiter = new AdvancedRateLimiter();
export const spamDetector = new SpamDetector();
export const ipLimiter = new IPRateLimiter();

/**
 * Cleanup function to run periodically
 */
export function cleanupRateLimiters(): void {
  rateLimiter.cleanup();
  
  // Run cleanup every hour
  setInterval(() => {
    rateLimiter.cleanup();
  }, 60 * 60 * 1000);
}

// Start cleanup on module load
if (typeof window !== 'undefined') {
  cleanupRateLimiters();
}
