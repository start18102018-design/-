import { useState, useCallback } from 'react';
import { spamDetector } from '../utils/antiSpam';

interface SpamDetectionResult {
  isSpam: boolean;
  reason?: string;
  confidence: number;
}

export function useSpamDetection(identifier: string) {
  const [result, setResult] = useState<SpamDetectionResult>({
    isSpam: false,
    confidence: 0
  });

  const checkContent = useCallback((content: string): SpamDetectionResult => {
    const spamCheck = spamDetector.isSpam(content, identifier);
    
    setResult({
      isSpam: spamCheck.isSpam,
      reason: spamCheck.reason,
      confidence: spamCheck.confidence
    });
    
    return {
      isSpam: spamCheck.isSpam,
      reason: spamCheck.reason,
      confidence: spamCheck.confidence
    };
  }, [identifier]);

  const clearHistory = useCallback(() => {
    spamDetector.clearHistory(identifier);
    setResult({
      isSpam: false,
      confidence: 0
    });
  }, [identifier]);

  return {
    ...result,
    checkContent,
    clearHistory
  };
}

export function useFormSpamProtection(identifier: string) {
  const [blockedCount, setBlockedCount] = useState(0);
  const [recentAttempts, setRecentAttempts] = useState(0);
  const [lastBlockedTime, setLastBlockedTime] = useState<Date | null>(null);

  const validateFormData = useCallback((formData: Record<string, string>): {
    isValid: boolean;
    errors: Record<string, string>;
    spamDetected: boolean;
  } => {
    const errors: Record<string, string> = {};
    let spamDetected = false;

    Object.entries(formData).forEach(([key, value]) => {
      if (typeof value === 'string' && value.trim().length > 0) {
        const spamCheck = spamDetector.isSpam(value, identifier);
        
        if (spamCheck.isSpam) {
          errors[key] = spamCheck.reason || 'Обнаружен спам';
          spamDetected = true;
          setBlockedCount(prev => prev + 1);
          setLastBlockedTime(new Date());
        }
      }
    });

    setRecentAttempts(prev => prev + 1);
    
    // Сбросить счетчик недавних попыток через 5 минут
    setTimeout(() => {
      setRecentAttempts(prev => Math.max(0, prev - 1));
    }, 5 * 60 * 1000);

    return {
      isValid: !spamDetected,
      errors,
      spamDetected
    };
  }, [identifier]);

  return {
    validateFormData,
    blockedCount,
    recentAttempts,
    lastBlockedTime,
    resetCounters: () => {
      setBlockedCount(0);
      setRecentAttempts(0);
      setLastBlockedTime(null);
    }
  };
}
