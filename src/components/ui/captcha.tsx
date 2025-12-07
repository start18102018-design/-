import { useState, useEffect } from 'react';
import { SimpleCaptcha } from '../../utils/antiSpam';
import { RefreshCw } from 'lucide-react';

interface CaptchaProps {
  onVerify: (isValid: boolean) => void;
  required?: boolean;
}

export function Captcha({ onVerify, required = false }: CaptchaProps) {
  const [captcha, setCaptcha] = useState<SimpleCaptcha>(new SimpleCaptcha());
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = () => {
    const isValid = captcha.verify(userAnswer);
    setIsVerified(isValid);
    
    if (isValid) {
      setError('');
      onVerify(true);
    } else {
      setError('Неверный ответ. Попробуйте еще раз.');
      onVerify(false);
      // Generate new captcha on failure
      setTimeout(() => {
        regenerateCaptcha();
      }, 1500);
    }
  };

  const regenerateCaptcha = () => {
    setCaptcha(new SimpleCaptcha());
    setUserAnswer('');
    setIsVerified(false);
    setError('');
    onVerify(false);
  };

  useEffect(() => {
    // Auto-verify when user enters answer
    if (userAnswer.length > 0 && !isVerified) {
      const timeout = setTimeout(() => {
        handleVerify();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [userAnswer]);

  if (!required) {
    return null;
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Проверка безопасности
      </label>
      
      <div className="flex items-center gap-3">
        {/* CAPTCHA Challenge */}
        <div className="flex-1 flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-mono text-lg select-none shadow-md">
            {captcha.getChallenge()} = ?
          </div>
          
          <input
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Ответ"
            className={`w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
              isVerified 
                ? 'border-green-500 bg-green-50' 
                : error 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300'
            }`}
            disabled={isVerified}
          />
          
          <button
            type="button"
            onClick={regenerateCaptcha}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Обновить"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
        
        {/* Status Indicator */}
        {isVerified && (
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Проверено
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Honeypot component (hidden field to catch bots)
 */
interface HoneypotProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
}

export function Honeypot({ name, value, onChange }: HoneypotProps) {
  return (
    <div 
      style={{ 
        position: 'absolute',
        left: '-9999px',
        width: '1px',
        height: '1px',
        overflow: 'hidden'
      }}
      aria-hidden="true"
      tabIndex={-1}
    >
      <label htmlFor={name}>
        Please leave this field empty (anti-spam)
      </label>
      <input
        type="text"
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}
