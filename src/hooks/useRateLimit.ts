import { useState, useEffect, useCallback } from 'react';
import { rateLimiter, ActionType } from '../utils/antiSpam';

interface RateLimitState {
  allowed: boolean;
  remainingAttempts: number;
  totalAttempts: number;
  isLocked: boolean;
  lockoutTime?: number;
  resetTime?: number;
  message?: string;
}

export function useRateLimit(identifier: string, actionType: ActionType) {
  const [state, setState] = useState<RateLimitState>({
    allowed: true,
    remainingAttempts: 0,
    totalAttempts: 0,
    isLocked: false
  });

  const checkLimit = useCallback(() => {
    const result = rateLimiter.checkLimit(identifier, actionType);
    const stats = rateLimiter.getStats(identifier, actionType);
    
    setState({
      allowed: result.allowed,
      remainingAttempts: result.remainingAttempts,
      totalAttempts: stats.totalAttempts,
      isLocked: stats.isLocked,
      lockoutTime: result.lockoutTime,
      resetTime: result.resetTime,
      message: result.message
    });
    
    return result.allowed;
  }, [identifier, actionType]);

  const recordAttempt = useCallback((success: boolean = false) => {
    rateLimiter.recordAttempt(identifier, actionType, success);
    checkLimit();
  }, [identifier, actionType, checkLimit]);

  const reset = useCallback(() => {
    rateLimiter.reset(identifier, actionType);
    checkLimit();
  }, [identifier, actionType, checkLimit]);

  useEffect(() => {
    checkLimit();
    
    // Периодически обновлять состояние (для обновления таймеров)
    const interval = setInterval(checkLimit, 5000);
    
    return () => clearInterval(interval);
  }, [checkLimit]);

  return {
    ...state,
    checkLimit,
    recordAttempt,
    reset
  };
}

export function useMultipleRateLimits(
  identifiers: Array<{ id: string; action: ActionType }>
) {
  const [states, setStates] = useState<Record<string, RateLimitState>>({});

  const checkAll = useCallback(() => {
    const newStates: Record<string, RateLimitState> = {};
    
    identifiers.forEach(({ id, action }) => {
      const result = rateLimiter.checkLimit(id, action);
      const stats = rateLimiter.getStats(id, action);
      
      newStates[`${action}:${id}`] = {
        allowed: result.allowed,
        remainingAttempts: result.remainingAttempts,
        totalAttempts: stats.totalAttempts,
        isLocked: stats.isLocked,
        lockoutTime: result.lockoutTime,
        resetTime: result.resetTime,
        message: result.message
      };
    });
    
    setStates(newStates);
  }, [identifiers]);

  useEffect(() => {
    checkAll();
    const interval = setInterval(checkAll, 5000);
    return () => clearInterval(interval);
  }, [checkAll]);

  return {
    states,
    checkAll,
    recordAttempt: (id: string, action: ActionType, success: boolean = false) => {
      rateLimiter.recordAttempt(id, action, success);
      checkAll();
    },
    reset: (id: string, action: ActionType) => {
      rateLimiter.reset(id, action);
      checkAll();
    }
  };
}
