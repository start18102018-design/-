import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle2, Ban } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';

interface SpamProtectionProps {
  isSpam: boolean;
  confidence: number;
  reason?: string;
  showDetails?: boolean;
}

export function SpamProtection({ 
  isSpam, 
  confidence, 
  reason,
  showDetails = false 
}: SpamProtectionProps) {
  if (!isSpam && !showDetails) {
    return null;
  }

  if (!isSpam && showDetails) {
    return (
      <Alert variant="default" className="border-green-500 bg-green-50">
        <CheckCircle2 className="w-4 h-4 text-green-600" />
        <AlertTitle className="text-green-900">
          Проверка пройдена
        </AlertTitle>
        <AlertDescription className="text-green-800 text-sm">
          Контент прошел проверку на спам
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive" className="border-red-600 bg-red-50">
      <Ban className="w-4 h-4 text-red-600" />
      <AlertTitle className="text-red-900 font-bold">
        Обнаружена подозрительная активность
      </AlertTitle>
      <AlertDescription className="text-red-800">
        <div className="space-y-2">
          <p>{reason || 'Контент не прошел проверку безопасности'}</p>
          
          <div className="flex items-center gap-2">
            <span className="text-sm">Уровень подозрительности:</span>
            <Badge 
              variant={confidence > 75 ? 'destructive' : 'default'}
              className={
                confidence > 75 
                  ? 'bg-red-600' 
                  : confidence > 50 
                  ? 'bg-yellow-600' 
                  : 'bg-orange-600'
              }
            >
              {confidence}%
            </Badge>
          </div>
          
          <div className="flex items-start gap-2 text-sm mt-2 p-2 bg-white/50 rounded">
            <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              Проверьте введенные данные и попробуйте еще раз. 
              Если вы считаете, что это ошибка, обратитесь в службу поддержки.
            </p>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}

interface SpamScoreIndicatorProps {
  score: number;
  showLabel?: boolean;
}

export function SpamScoreIndicator({ score, showLabel = true }: SpamScoreIndicatorProps) {
  const getColor = () => {
    if (score >= 75) return 'text-red-600';
    if (score >= 50) return 'text-yellow-600';
    if (score >= 25) return 'text-orange-600';
    return 'text-green-600';
  };

  const getLabel = () => {
    if (score >= 75) return 'Высокий риск';
    if (score >= 50) return 'Средний риск';
    if (score >= 25) return 'Низкий риск';
    return 'Безопасно';
  };

  return (
    <div className="flex items-center gap-2">
      <Shield className={`w-4 h-4 ${getColor()}`} />
      {showLabel && (
        <span className={`text-sm font-medium ${getColor()}`}>
          {getLabel()}
        </span>
      )}
      <span className={`text-xs ${getColor()}`}>
        ({score}%)
      </span>
    </div>
  );
}

interface AntiSpamMonitorProps {
  totalBlocked: number;
  recentAttempts: number;
  lastBlockedTime?: Date;
}

export function AntiSpamMonitor({ 
  totalBlocked, 
  recentAttempts,
  lastBlockedTime 
}: AntiSpamMonitorProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Показывать монитор если есть активность
    if (recentAttempts > 0 || totalBlocked > 0) {
      setIsVisible(true);
    }
  }, [recentAttempts, totalBlocked]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Alert className="border-blue-500 bg-blue-50 shadow-lg max-w-sm">
        <Shield className="w-4 h-4 text-blue-600" />
        <AlertTitle className="text-blue-900 text-sm font-bold">
          Защита активна
        </AlertTitle>
        <AlertDescription className="text-blue-800 text-xs">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Заблокировано спама:</span>
              <Badge variant="secondary" className="bg-blue-600 text-white">
                {totalBlocked}
              </Badge>
            </div>
            {recentAttempts > 0 && (
              <div className="flex justify-between">
                <span>Недавних попыток:</span>
                <Badge variant="secondary" className="bg-yellow-600 text-white">
                  {recentAttempts}
                </Badge>
              </div>
            )}
            {lastBlockedTime && (
              <div className="text-[10px] text-blue-600 mt-1">
                Последняя блокировка: {lastBlockedTime.toLocaleTimeString('ru-RU')}
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
