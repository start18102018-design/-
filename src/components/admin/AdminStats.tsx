import { TrendingUp, Users, CreditCard, FileText, MessageCircle, Gauge } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';

export function AdminStats() {
  const stats = {
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    totalDebt: 0,
    paymentsThisMonth: 0,
    receiptsGenerated: 0,
    pendingQuestions: 0,
    answeredQuestions: 0,
    meterReadingsThisMonth: 0,
    announcements: 0
  };

  const recentActivity: any[] = [];

  const topDebtors: any[] = [];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-600">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <Badge className="bg-green-500">
                +{stats.newUsersThisMonth}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">Всего пользователей</p>
            <p className="text-3xl mb-1">{stats.totalUsers.toLocaleString('ru-RU')}</p>
            <p className="text-xs text-gray-500">Активных: {stats.activeUsers}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-600">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <Badge className="bg-green-500">
                Ноябрь
              </Badge>
            </div>
            <p className="text-sm text-gray-600">Платежи за месяц</p>
            <p className="text-3xl mb-1">
              {(stats.paymentsThisMonth / 1000000).toFixed(1)}М ₽
            </p>
            <p className="text-xs text-gray-500">+15% к прошлому месяцу</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-600">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-orange-600" />
              </div>
              <Badge className="bg-orange-500">
                Задолженность
              </Badge>
            </div>
            <p className="text-sm text-gray-600">Общий долг</p>
            <p className="text-3xl mb-1 text-orange-600">
              {(stats.totalDebt / 1000000).toFixed(1)}М ₽
            </p>
            <p className="text-xs text-gray-500">У {Math.floor(stats.totalUsers * 0.35)} пользователей</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-600">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <Badge className="bg-purple-500">
                Ноябрь
              </Badge>
            </div>
            <p className="text-sm text-gray-600">Квитанции выставлено</p>
            <p className="text-3xl mb-1">{stats.receiptsGenerated.toLocaleString('ru-RU')}</p>
            <p className="text-xs text-gray-500">100% пользователей</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Вопросы-Ответы</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{stats.pendingQuestions}</span>
                  <span className="text-sm text-gray-500">ожидают</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Всего обработано: {stats.answeredQuestions}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Gauge className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Показания счетчиков</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{stats.meterReadingsThisMonth}</span>
                  <span className="text-sm text-gray-500">за ноябрь</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {Math.floor((stats.meterReadingsThisMonth / stats.totalUsers) * 100)}% от общего числа
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Объявления</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{stats.announcements}</span>
                  <span className="text-sm text-gray-500">активных</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Последнее: 2 дня назад
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Top Debtors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Последняя активность</CardTitle>
            <CardDescription>
              Действия пользователей в реальном времени
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activity.type === 'payment' ? 'bg-green-100' :
                    activity.type === 'question' ? 'bg-blue-100' :
                    activity.type === 'meter' ? 'bg-purple-100' :
                    'bg-orange-100'
                  }`}>
                    {activity.type === 'payment' && <CreditCard className="w-5 h-5 text-green-600" />}
                    {activity.type === 'question' && <MessageCircle className="w-5 h-5 text-blue-600" />}
                    {activity.type === 'meter' && <Gauge className="w-5 h-5 text-purple-600" />}
                    {activity.type === 'registration' && <Users className="w-5 h-5 text-orange-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{activity.user}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-600">{activity.action}</p>
                      {activity.amount && (
                        <Badge variant="outline" className="text-xs">
                          {activity.amount.toLocaleString('ru-RU')} ₽
                        </Badge>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Debtors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Топ должников</CardTitle>
            <CardDescription>
              Пользователи с наибольшей задолженностью
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topDebtors.map((debtor, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{debtor.name}</p>
                    <p className="text-xs text-gray-600 truncate">{debtor.address}</p>
                  </div>
                  <span className="text-sm text-red-600 whitespace-nowrap">
                    {debtor.debt.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}