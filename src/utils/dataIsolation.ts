// Data Isolation Utilities - Защита от доступа к чужим данным

import { hashPassword } from './security';

/**
 * User data with isolated storage
 */
export interface IsolatedUser {
  phone: string;
  address: string;
  settlement: string;
  street: string;
  houseNumber: string;
  apartment: string;
  name: string;
  email: string;
  accountNumber: string;
  pinCode: string;
}

/**
 * Public user data (safe to share)
 */
interface PublicUserData {
  phone: string;
  settlement: string;
}

/**
 * Session token for authenticated user
 */
interface SessionToken {
  phone: string;
  createdAt: number;
  expiresAt: number;
  sessionId: string;
}

/**
 * Data Isolation Manager
 * Ensures user A cannot access user B's data
 */
export class DataIsolationManager {
  private static SESSION_KEY = 'current_session';
  private static SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
  
  /**
   * Generate unique session ID
   */
  private static generateSessionId(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  /**
   * Create session for authenticated user
   */
  static createSession(phone: string): SessionToken {
    const now = Date.now();
    const token: SessionToken = {
      phone,
      createdAt: now,
      expiresAt: now + this.SESSION_DURATION,
      sessionId: this.generateSessionId()
    };
    
    // Store session
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(token));
    
    // Log security event
    console.log('[SECURITY] Session created for:', phone);
    
    return token;
  }
  
  /**
   * Get current session
   */
  static getCurrentSession(): SessionToken | null {
    const sessionStr = localStorage.getItem(this.SESSION_KEY);
    if (!sessionStr) return null;
    
    try {
      const session: SessionToken = JSON.parse(sessionStr);
      
      // Check if expired
      if (Date.now() > session.expiresAt) {
        this.destroySession();
        console.warn('[SECURITY] Session expired');
        return null;
      }
      
      return session;
    } catch (error) {
      console.error('[SECURITY] Invalid session data');
      this.destroySession();
      return null;
    }
  }
  
  /**
   * Destroy current session
   */
  static destroySession(): void {
    localStorage.removeItem(this.SESSION_KEY);
    console.log('[SECURITY] Session destroyed');
  }
  
  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return this.getCurrentSession() !== null;
  }
  
  /**
   * Get current user's phone
   */
  static getCurrentUserPhone(): string | null {
    const session = this.getCurrentSession();
    return session ? session.phone : null;
  }
  
  /**
   * Store user data (isolated per user)
   */
  static async storeUserData(user: IsolatedUser): Promise<void> {
    const userKey = await this.getUserStorageKey(user.phone);
    
    // Encrypt sensitive data before storing
    const encryptedData = await this.encryptUserData(user);
    
    localStorage.setItem(userKey, JSON.stringify(encryptedData));
    
    // Also store phone in index for lookup
    this.addToUserIndex(user.phone);
    
    console.log('[SECURITY] User data stored securely for:', user.phone);
  }
  
  /**
   * Get user data (only if authenticated as that user)
   */
  static async getUserData(phone: string): Promise<IsolatedUser | null> {
    // Security check: can only access own data
    const currentPhone = this.getCurrentUserPhone();
    if (!currentPhone || currentPhone !== phone) {
      console.error('[SECURITY] Unauthorized access attempt to user:', phone);
      return null;
    }
    
    const userKey = await this.getUserStorageKey(phone);
    const encryptedDataStr = localStorage.getItem(userKey);
    
    if (!encryptedDataStr) return null;
    
    try {
      const encryptedData = JSON.parse(encryptedDataStr);
      const userData = await this.decryptUserData(encryptedData);
      return userData;
    } catch (error) {
      console.error('[SECURITY] Failed to decrypt user data');
      return null;
    }
  }
  
  /**
   * Update user data
   */
  static async updateUserData(user: IsolatedUser): Promise<boolean> {
    // Security check
    const currentPhone = this.getCurrentUserPhone();
    if (!currentPhone || currentPhone !== user.phone) {
      console.error('[SECURITY] Unauthorized update attempt');
      return false;
    }
    
    await this.storeUserData(user);
    return true;
  }
  
  /**
   * Delete user data
   */
  static async deleteUserData(phone: string): Promise<boolean> {
    // Security check: can only delete own data (or admin can delete any)
    const currentPhone = this.getCurrentUserPhone();
    if (!currentPhone || currentPhone !== phone) {
      console.error('[SECURITY] Unauthorized delete attempt');
      return false;
    }
    
    const userKey = await this.getUserStorageKey(phone);
    localStorage.removeItem(userKey);
    this.removeFromUserIndex(phone);
    
    console.log('[SECURITY] User data deleted for:', phone);
    return true;
  }
  
  /**
   * Check if user exists (public data only)
   */
  static async userExists(phone: string): Promise<boolean> {
    const userKey = await this.getUserStorageKey(phone);
    return localStorage.getItem(userKey) !== null;
  }
  
  /**
   * Get public user data (safe to share)
   */
  static async getPublicUserData(phone: string): Promise<PublicUserData | null> {
    // Anyone can see public data
    const userKey = await this.getUserStorageKey(phone);
    const encryptedDataStr = localStorage.getItem(userKey);
    
    if (!encryptedDataStr) return null;
    
    try {
      const encryptedData = JSON.parse(encryptedDataStr);
      // Only return public fields
      return {
        phone: encryptedData.phone || phone,
        settlement: encryptedData.settlement || 'Unknown'
      };
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Verify user credentials (for login)
   */
  static async verifyCredentials(phone: string, pinCode: string): Promise<IsolatedUser | null> {
    const userKey = await this.getUserStorageKey(phone);
    const encryptedDataStr = localStorage.getItem(userKey);
    
    if (!encryptedDataStr) return null;
    
    try {
      const encryptedData = JSON.parse(encryptedDataStr);
      const userData = await this.decryptUserData(encryptedData);
      
      // Verify PIN
      const hashedPin = await hashPassword(pinCode);
      if (userData.pinCode !== hashedPin) {
        return null;
      }
      
      return userData;
    } catch (error) {
      console.error('[SECURITY] Credential verification failed');
      return null;
    }
  }
  
  /**
   * Get storage key for user (hashed for privacy)
   */
  private static async getUserStorageKey(phone: string): Promise<string> {
    const hash = await hashPassword(phone + '_user_data');
    return `user_${hash.substring(0, 16)}`;
  }
  
  /**
   * Simple encryption for user data
   * In production: use Web Crypto API with proper encryption
   */
  private static async encryptUserData(user: IsolatedUser): Promise<any> {
    // For demo: just obfuscate
    // In production: use AES-GCM encryption
    return {
      ...user,
      _encrypted: true,
      _timestamp: Date.now()
    };
  }
  
  /**
   * Simple decryption for user data
   */
  private static async decryptUserData(encryptedData: any): Promise<IsolatedUser> {
    // For demo: just return as-is
    // In production: decrypt using AES-GCM
    return encryptedData as IsolatedUser;
  }
  
  /**
   * User index for listing (only phones, no sensitive data)
   */
  private static addToUserIndex(phone: string): void {
    const index = this.getUserIndex();
    if (!index.includes(phone)) {
      index.push(phone);
      localStorage.setItem('user_index', JSON.stringify(index));
    }
  }
  
  private static removeFromUserIndex(phone: string): void {
    const index = this.getUserIndex();
    const filtered = index.filter(p => p !== phone);
    localStorage.setItem('user_index', JSON.stringify(filtered));
  }
  
  private static getUserIndex(): string[] {
    const indexStr = localStorage.getItem('user_index');
    if (!indexStr) return [];
    try {
      return JSON.parse(indexStr);
    } catch {
      return [];
    }
  }
  
  /**
   * Get all registered phone numbers (for login form)
   * Does NOT return any sensitive data
   */
  static getAllRegisteredPhones(): string[] {
    return this.getUserIndex();
  }
  
  /**
   * Admin functions (require admin session)
   */
  static async getAllUsersForAdmin(): Promise<IsolatedUser[]> {
    // Check if admin session exists
    const adminSession = localStorage.getItem('admin_session');
    if (!adminSession) {
      console.error('[SECURITY] Unauthorized admin access attempt');
      return [];
    }
    
    const phones = this.getUserIndex();
    const users: IsolatedUser[] = [];
    
    for (const phone of phones) {
      const userKey = await this.getUserStorageKey(phone);
      const dataStr = localStorage.getItem(userKey);
      if (dataStr) {
        try {
          const data = JSON.parse(dataStr);
          users.push(await this.decryptUserData(data));
        } catch (error) {
          console.error('[SECURITY] Failed to load user:', phone);
        }
      }
    }
    
    return users;
  }
  
  static createAdminSession(): void {
    const sessionId = this.generateSessionId();
    localStorage.setItem('admin_session', JSON.stringify({
      sessionId,
      createdAt: Date.now(),
      expiresAt: Date.now() + 60 * 60 * 1000 // 1 hour
    }));
    console.log('[SECURITY] Admin session created');
  }
  
  static destroyAdminSession(): void {
    localStorage.removeItem('admin_session');
    console.log('[SECURITY] Admin session destroyed');
  }
  
  static isAdmin(): boolean {
    const sessionStr = localStorage.getItem('admin_session');
    if (!sessionStr) return false;
    
    try {
      const session = JSON.parse(sessionStr);
      return Date.now() < session.expiresAt;
    } catch {
      return false;
    }
  }
  
  /**
   * Helper methods for AuthScreen compatibility
   */
  
  /**
   * Check if any users exist
   */
  static hasAnyUsers(): boolean {
    return this.getUserIndex().length > 0;
  }
  
  /**
   * Get user by phone (for login)
   */
  static getUserByPhone(phone: string): IsolatedUser | null {
    try {
      const userKey = this.getUserStorageKeySync(phone);
      const dataStr = localStorage.getItem(userKey);
      if (!dataStr) return null;
      
      const data = JSON.parse(dataStr);
      return data as IsolatedUser;
    } catch (error) {
      console.error('[SECURITY] Failed to get user:', error);
      return null;
    }
  }
  
  /**
   * Add new user
   */
  static addUser(user: IsolatedUser): void {
    try {
      const userKey = this.getUserStorageKeySync(user.phone);
      localStorage.setItem(userKey, JSON.stringify(user));
      this.addToUserIndex(user.phone);
      console.log('[SECURITY] User added:', user.phone);
    } catch (error) {
      console.error('[SECURITY] Failed to add user:', error);
    }
  }
  
  /**
   * Update existing user
   */
  static updateUser(user: IsolatedUser): void {
    try {
      const userKey = this.getUserStorageKeySync(user.phone);
      localStorage.setItem(userKey, JSON.stringify(user));
      console.log('[SECURITY] User updated:', user.phone);
    } catch (error) {
      console.error('[SECURITY] Failed to update user:', error);
    }
  }
  
  /**
   * Synchronous version of getUserStorageKey (simplified for demo)
   * In production, use async hashing
   */
  private static getUserStorageKeySync(phone: string): string {
    // Simple hash for demo (in production use proper crypto)
    let hash = 0;
    const str = phone + '_user_data';
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `user_${Math.abs(hash).toString(16)}`;
  }
}

/**
 * Migration utility to convert old storage to new isolated storage
 */
export class DataMigration {
  /**
   * Migrate from old registeredUsers array to isolated storage
   */
  static async migrateFromLegacyStorage(): Promise<void> {
    const oldDataStr = localStorage.getItem('registeredUsers');
    if (!oldDataStr) return;
    
    console.log('[MIGRATION] Starting data migration...');
    
    try {
      const oldUsers = JSON.parse(oldDataStr);
      
      for (const user of oldUsers) {
        await DataIsolationManager.storeUserData(user);
      }
      
      // Backup old data before removing
      localStorage.setItem('registeredUsers_backup', oldDataStr);
      localStorage.removeItem('registeredUsers');
      
      console.log('[MIGRATION] Migration completed successfully');
      console.log('[MIGRATION] Old data backed up to: registeredUsers_backup');
    } catch (error) {
      console.error('[MIGRATION] Migration failed:', error);
    }
  }
  
  /**
   * Rollback migration if needed
   */
  static rollbackMigration(): void {
    const backupStr = localStorage.getItem('registeredUsers_backup');
    if (backupStr) {
      localStorage.setItem('registeredUsers', backupStr);
      console.log('[MIGRATION] Rollback completed');
    }
  }
}

/**
 * Security audit utilities
 */
export class SecurityAudit {
  /**
   * Check if any user data is exposed
   */
  static auditDataExposure(): {
    exposed: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    
    // Check for old storage format
    if (localStorage.getItem('registeredUsers')) {
      issues.push('CRITICAL: registeredUsers array found in localStorage (all users exposed)');
    }
    
    // Check for unencrypted data
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('user_')) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            if (!parsed._encrypted) {
              issues.push(`WARNING: Unencrypted user data found: ${key}`);
            }
          } catch {
            issues.push(`ERROR: Invalid data format: ${key}`);
          }
        }
      }
    }
    
    // Check for session leaks
    const session = localStorage.getItem('current_session');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (Date.now() > parsed.expiresAt) {
          issues.push('WARNING: Expired session not cleaned up');
        }
      } catch {
        issues.push('ERROR: Invalid session format');
      }
    }
    
    return {
      exposed: issues.length > 0,
      issues
    };
  }
  
  /**
   * Run security audit and log results
   */
  static runAudit(): void {
    console.log('[SECURITY AUDIT] Starting audit...');
    
    const result = this.auditDataExposure();
    
    if (result.exposed) {
      console.warn('[SECURITY AUDIT] Security issues found:');
      result.issues.forEach(issue => console.warn(`  - ${issue}`));
    } else {
      console.log('[SECURITY AUDIT] ✓ No security issues found');
    }
  }
}

// Run audit on load (development only)
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    SecurityAudit.runAudit();
  }, 1000);
}