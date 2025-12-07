import { useState, useCallback, FormEvent, ReactNode } from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { RateLimitIndicator } from './RateLimitIndicator';
import { SpamProtection } from './SpamProtection';
import { useRateLimit } from '../hooks/useRateLimit';
import { useSpamDetection } from '../hooks/useSpamDetection';
import { ActionType } from '../utils/antiSpam';
import { toast } from 'sonner';

interface ProtectedFormProps {
  identifier: string;
  actionType: ActionType;
  onSubmit: (data: any) => Promise<void> | void;
  children: ReactNode;
  submitButtonText?: string;
  checkSpam?: boolean;
  spamCheckFields?: string[];
  className?: string;
  showSecurityIndicators?: boolean;
}

export function ProtectedForm({
  identifier,
  actionType,
  onSubmit,
  children,
  submitButtonText = 'Отправить',
  checkSpam = true,
  spamCheckFields = [],
  className = '',
  showSecurityIndicators = true
}: ProtectedFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  
  const rateLimit = useRateLimit(identifier, actionType);
  const spamDetection = useSpamDetection(identifier);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    
    // Проверка rate limit
    if (!rateLimit.checkLimit()) {
      toast.error(rateLimit.message || 'Превышен лимит попыток');
      return;
    }

    // Проверка на спам
    if (checkSpam && spamCheckFields.length > 0) {
      let spamDetected = false;
      
      for (const field of spamCheckFields) {
        if (formData[field]) {
          const result = spamDetection.checkContent(String(formData[field]));
          if (result.isSpam) {
            toast.error(`Обнаружен спам в поле: ${field}`);
            spamDetected = true;
            break;
          }
        }
      }
      
      if (spamDetected) {
        rateLimit.recordAttempt(false);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      rateLimit.recordAttempt(true); // Success
      toast.success('Форма успешно отправлена');
    } catch (error) {
      rateLimit.recordAttempt(false); // Failure
      toast.error('Ошибка при отправке формы');
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, rateLimit, spamDetection, checkSpam, spamCheckFields, onSubmit]);

  const updateFormData = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">
        {/* Security indicators */}
        {showSecurityIndicators && (
          <div className="space-y-3">
            <RateLimitIndicator
              remainingAttempts={rateLimit.remainingAttempts}
              maxAttempts={5}
              lockoutTime={rateLimit.lockoutTime}
              isLocked={rateLimit.isLocked}
              actionType={actionType}
            />

            {checkSpam && spamDetection.isSpam && (
              <SpamProtection
                isSpam={spamDetection.isSpam}
                confidence={spamDetection.confidence}
                reason={spamDetection.reason}
              />
            )}
          </div>
        )}

        {/* Form content */}
        <div className="space-y-4">
          {typeof children === 'function' 
            ? children({ formData, updateFormData, isSubmitting })
            : children
          }
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          disabled={isSubmitting || rateLimit.isLocked || !rateLimit.allowed}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Отправка...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-2" />
              {submitButtonText}
            </>
          )}
        </Button>

        {/* Security info */}
        {showSecurityIndicators && (
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-2">
            <Shield className="w-3 h-3" />
            <span>Защищено Rate Limiting и Anti-Spam</span>
          </div>
        )}
      </div>
    </form>
  );
}

// HOC для оборачивания существующих форм
export function withSpamProtection<P extends object>(
  Component: React.ComponentType<P>,
  config: {
    identifier: (props: P) => string;
    actionType: ActionType;
    spamCheckFields?: string[];
  }
) {
  return function ProtectedComponent(props: P) {
    const identifier = config.identifier(props);
    const rateLimit = useRateLimit(identifier, config.actionType);

    if (rateLimit.isLocked) {
      return (
        <div className="p-6">
          <RateLimitIndicator
            remainingAttempts={rateLimit.remainingAttempts}
            maxAttempts={5}
            lockoutTime={rateLimit.lockoutTime}
            isLocked={rateLimit.isLocked}
            actionType={config.actionType}
          />
        </div>
      );
    }

    return <Component {...props} />;
  };
}
