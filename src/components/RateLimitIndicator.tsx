import { AlertCircle, Shield, Clock, Ban } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Progress } from './ui/progress';

interface RateLimitIndicatorProps {
  remainingAttempts: number;
  maxAttempts: number;
  lockoutTime?: number;
  isLocked: boolean;
  actionType?: string;
}

export function RateLimitIndicator({
  remainingAttempts,
  maxAttempts,
  lockoutTime,
  isLocked,
  actionType = 'действия'
}: RateLimitIndicatorProps) {
  const percentage = (remainingAttempts / maxAttempts) * 100;
  
  const getVariant = () => {
    if (isLocked) return 'destructive';
    if (percentage <= 20) return 'destructive';
    if (percentage <= 40) return 'warning';
    return 'default';
  };

  const getColor = () => {
    if (isLocked) return 'bg-red-600';
    if (percentage <= 20) return 'bg-red-500';
    if (percentage <= 40) return 'bg-yellow-500';
    if (percentage <= 60) return 'bg-blue-500';
    return 'bg-green-500';
  };

  if (isLocked && lockoutTime) {
    const minutes = Math.ceil(lockoutTime / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    return (
      <Alert variant="destructive" className="border-red-600 bg-red-50">
        <Ban className="w-4 h-4 text-red-600" />
        <AlertTitle className="text-red-900 font-bold">
          Доступ временно заблокирован
        </AlertTitle>
        <AlertDescription className="text-red-800">
          <div className="space-y-2">
            <p>
              Превышено максимальное количество попыток {actionType}.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              <span className="font-semibold">
                Попробуйте снова через:{' '}
                {hours > 0 && `${hours} ч `}
                {remainingMinutes} мин
              </span>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Показывать только если осталось меньше 80% попыток
  if (percentage >= 80) {
    return null;
  }

  return (
    <Alert 
      variant={getVariant() as any}
      className={`border-2 ${
        percentage <= 20 
          ? 'border-red-500 bg-red-50' 
          : percentage <= 40 
          ? 'border-yellow-500 bg-yellow-50'
          : 'border-blue-500 bg-blue-50'
      }`}
    >
      <AlertCircle className={`w-4 h-4 ${
        percentage <= 20 
          ? 'text-red-600' 
          : percentage <= 40 
          ? 'text-yellow-600'
          : 'text-blue-600'
      }`} />
      <AlertTitle className={`font-bold ${
        percentage <= 20 
          ? 'text-red-900' 
          : percentage <= 40 
          ? 'text-yellow-900'
          : 'text-blue-900'
      }`}>
        <div className="flex items-center justify-between">
          <span>Внимание: осталось попыток</span>
          <span className="text-lg">{remainingAttempts} / {maxAttempts}</span>
        </div>
      </AlertTitle>
      <AlertDescription className={`${
        percentage <= 20 
          ? 'text-red-800' 
          : percentage <= 40 
          ? 'text-yellow-800'
          : 'text-blue-800'
      }`}>
        <div className="space-y-3 mt-2">
          <Progress 
            value={percentage} 
            className={`h-2 ${
              percentage <= 20 
                ? '[&>div]:bg-red-600' 
                : percentage <= 40 
                ? '[&>div]:bg-yellow-600'
                : '[&>div]:bg-blue-600'
            }`}
          />
          
          <div className="flex items-start gap-2 text-sm">
            <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              {percentage <= 20 ? (
                <span className="font-semibold">
                  При превышении лимита доступ будет заблокирован на 30 минут.
                </span>
              ) : percentage <= 40 ? (
                <span>
                  Будьте внимательны при вводе данных.
                </span>
              ) : (
                <span>
                  Проверьте правильность введенных данных.
                </span>
              )}
            </p>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
