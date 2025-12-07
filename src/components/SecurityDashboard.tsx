import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Ban, Activity, Clock, TrendingDown, Lock, Unlock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { rateLimiter, spamDetector, ipLimiter, ActionType } from '../utils/antiSpam';

interface SecurityStats {
  totalAttempts: number;
  blockedAttempts: number;
  activeUsers: number;
  spamBlocked: number;
  rateLimitActive: number;
}

export function SecurityDashboard() {
  const [stats, setStats] = useState<SecurityStats>({
    totalAttempts: 0,
    blockedAttempts: 0,
    activeUsers: 0,
    spamBlocked: 0,
    rateLimitActive: 0
  });

  const [recentEvents, setRecentEvents] = useState<Array<{
    type: string;
    timestamp: number;
    details: string;
  }>>([]);

  useEffect(() => {
    // Загрузить статистику из localStorage
    const loadStats = () => {
      const events = localStorage.getItem('security_events');
      if (events) {
        try {
          const parsed = JSON.parse(events);
          
          // Подсчет статистики
          const last24h = Date.now() - 24 * 60 * 60 * 1000;
          const recentEvents = parsed.filter((e: any) => e.timestamp > last24h);
          
          setStats({
            totalAttempts: recentEvents.length,
            blockedAttempts: recentEvents.filter((e: any) => 
              e.type === 'failed_login' || e.type === 'suspicious_activity'
            ).length,
            activeUsers: new Set(recentEvents.map((e: any) => e.userId)).size,
            spamBlocked: recentEvents.filter((e: any) => 
              e.details?.spamDetected
            ).length,
            rateLimitActive: recentEvents.filter((e: any) => 
              e.type === 'rate_limit_exceeded'
            ).length
          });

          setRecentEvents(
            recentEvents.slice(-10).reverse().map((e: any) => ({
              type: e.type,
              timestamp: e.timestamp,
              details: e.details?.reason || e.type
            }))
          );
        } catch (error) {
          console.error('Failed to load security stats', error);
        }
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const blockRate = stats.totalAttempts > 0 
    ? (stats.blockedAttempts / stats.totalAttempts) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Общая статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-900">
                Всего попыток
              </CardTitle>
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.totalAttempts}</div>
            <p className="text-xs text-blue-600 mt-1">За последние 24 часа</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-red-900">
                Заблокировано
              </CardTitle>
              <Ban className="w-4 h-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{stats.blockedAttempts}</div>
            <div className="flex items-center gap-2 mt-1">
              <Progress 
                value={blockRate} 
                className="h-1 [&>div]:bg-red-600"
              />
              <span className="text-xs text-red-600 whitespace-nowrap">
                {blockRate.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-yellow-900">
                Спам блокирован
              </CardTitle>
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{stats.spamBlocked}</div>
            <p className="text-xs text-yellow-600 mt-1">Подозрительные сообщения</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-900">
                Активных пользователей
              </CardTitle>
              <Shield className="w-4 h-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.activeUsers}</div>
            <p className="text-xs text-green-600 mt-1">Уникальных за сутки</p>
          </CardContent>
        </Card>
      </div>

      {/* Rate Limiting Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            Статус Rate Limiting
          </CardTitle>
          <CardDescription>
            Активные ограничения и блокировки
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.rateLimitActive > 0 ? (
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2">
                  <Ban className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-900">
                    Активные блокировки
                  </span>
                </div>
                <Badge variant="destructive" className="bg-red-600">
                  {stats.rateLimitActive}
                </Badge>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <Unlock className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">
                    Блокировок нет
                  </span>
                </div>
                <Badge variant="default" className="bg-green-600 text-white">
                  Активно
                </Badge>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-600 mb-1">Лимит входов</div>
                <div className="text-sm font-bold text-blue-900">5 попыток / 15 мин</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-600 mb-1">Лимит регистраций</div>
                <div className="text-sm font-bold text-blue-900">3 попытки / 1 час</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Недавние события */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Недавние события безопасности
          </CardTitle>
          <CardDescription>
            Последние 10 событий
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentEvents.length > 0 ? (
            <div className="space-y-2">
              {recentEvents.map((event, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {event.type === 'failed_login' ? (
                      <Ban className="w-4 h-4 text-red-600" />
                    ) : event.type === 'login' ? (
                      <Unlock className="w-4 h-4 text-green-600" />
                    ) : event.type === 'suspicious_activity' ? (
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    ) : (
                      <Activity className="w-4 h-4 text-blue-600" />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {event.type === 'failed_login' ? 'Неудачная попытка входа' :
                         event.type === 'login' ? 'Успешный вход' :
                         event.type === 'suspicious_activity' ? 'Подозрительная активность' :
                         event.type}
                      </div>
                      <div className="text-xs text-gray-500">{event.details}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(event.timestamp).toLocaleTimeString('ru-RU')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Нет недавних событий</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Защита от спама */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Система защиты от спама
          </CardTitle>
          <CardDescription>
            6-уровневая защита активна
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm font-medium text-green-900">URL фильтр</span>
              </div>
              <p className="text-xs text-green-700">Блокировка множественных ссылок</p>
            </div>

            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm font-medium text-green-900">Паттерн анализ</span>
              </div>
              <p className="text-xs text-green-700">Обнаружение повторений</p>
            </div>

            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm font-medium text-green-900">Спецсимволы</span>
              </div>
              <p className="text-xs text-green-700">Проверка символов</p>
            </div>

            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm font-medium text-green-900">Дубликаты</span>
              </div>
              <p className="text-xs text-green-700">История отправок</p>
            </div>

            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm font-medium text-green-900">Ключевые слова</span>
              </div>
              <p className="text-xs text-green-700">Спам-словарь</p>
            </div>

            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm font-medium text-green-900">Honeypot</span>
              </div>
              <p className="text-xs text-green-700">Ловушка для ботов</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
