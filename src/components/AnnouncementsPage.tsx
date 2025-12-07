import { Bell, AlertCircle, Info, Droplets, Zap, Flame, CreditCard, Gauge, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import type { User } from '../App';

interface Announcement {
  id: string;
  type: 'info' | 'warning' | 'urgent';
  service: 'water' | 'electricity' | 'heating' | 'general';
  title: string;
  message: string;
  date: string;
  settlement: string; // 'all' или конкретный населенный пункт
  published: boolean; // Флаг, указывающий, опубликовано ли объявление
}

interface AnnouncementsPageProps {
  onNavigateToMeters?: () => void;
  onNavigateToPayment?: () => void;
  userSettlement?: string;
}

const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    type: 'urgent',
    service: 'water',
    title: 'Отключение холодной воды',
    message: 'Уважаемые жители! 20 ноября с 9:00 до 18:00 будет производиться ремонт водопровода. Холодная вода будет отключена.',
    date: new Date().toISOString(),
    settlement: 'г. Бодайбо',
    published: true
  },
  {
    id: '2',
    type: 'warning',
    service: 'electricity',
    title: 'Плановые работы на электросетях',
    message: 'В связи с плановым ремонтом 22 ноября с 10:00 до 14:00 возможны кратковременные отключения электроэнергии.',
    date: new Date(Date.now() - 86400000).toISOString(),
    settlement: 'all',
    published: true
  },
  {
    id: '3',
    type: 'info',
    service: 'heating',
    title: 'Начало отопительного сезона',
    message: 'Информируем, что отопительный сезон начнется с 15 октября. Проверьте состояние батарей в квартире.',
    date: new Date(Date.now() - 172800000).toISOString(),
    settlement: 'all',
    published: true
  },
  {
    id: '4',
    type: 'info',
    service: 'general',
    title: 'Передача показаний счетчиков',
    message: 'Напоминаем, что показания приборов учета необходимо передавать с 23 по 26 число каждого месяца.',
    date: new Date(Date.now() - 259200000).toISOString(),
    settlement: 'п. Мамакан',
    published: true
  },
  {
    id: '5',
    type: 'urgent',
    service: 'water',
    title: 'Авария на водопроводе',
    message: 'Внимание! Произошла авария на водопроводе. Холодная вода отключена до устранения неполадок. Ориентировочное время восстановления - 6 часов.',
    date: new Date(Date.now() - 3600000).toISOString(),
    settlement: 'п. Балахнинский',
    published: true
  }
];

const typeConfig = {
  urgent: {
    color: 'bg-red-500',
    textColor: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: AlertCircle,
    label: 'Срочно'
  },
  warning: {
    color: 'bg-orange-500',
    textColor: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    icon: Bell,
    label: 'Важно'
  },
  info: {
    color: 'bg-blue-500',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: Info,
    label: 'Информация'
  }
};

const serviceIcons = {
  water: Droplets,
  electricity: Zap,
  heating: Flame,
  general: Bell
};

export function AnnouncementsPage({ onNavigateToMeters, onNavigateToPayment, userSettlement }: AnnouncementsPageProps) {
  const debt = 1250.50; // Сумма задолженности

  // Фильтруем объявления - только опубликованные и для населенного пункта пользователя
  const userAnnouncements = mockAnnouncements.filter(
    announcement => 
      announcement.published && 
      (announcement.settlement === 'all' || announcement.settlement === userSettlement)
  );

  return (
    <div className="max-w-2xl mx-auto px-3 py-4 sm:px-4 sm:py-6 space-y-4 sm:space-y-6 pb-6 sm:pb-8">
      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Debt Card with Gradient */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -5, scale: 1.02 }}
          className="relative overflow-hidden rounded-3xl shadow-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-600" />
          <div className="relative p-5 text-white">
            <motion.div 
              className="flex items-center gap-2 mb-2"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <CreditCard className="w-5 h-5" />
              <span className="text-xs font-medium">Задолженность</span>
            </motion.div>
            <p className="text-3xl font-bold mb-3">1 250.50 ₽</p>
            <motion.button
              onClick={onNavigateToPayment}
              className="w-full bg-white text-red-600 py-2.5 px-4 rounded-2xl text-sm font-bold hover:bg-red-50 transition-colors shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Оплатить сейчас 💳
            </motion.button>
          </div>
        </motion.div>

        {/* Meters Card with Gradient */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -5, scale: 1.02 }}
          className="relative overflow-hidden rounded-3xl shadow-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600" />
          <div className="relative p-5 text-white">
            <motion.div 
              className="flex items-center gap-2 mb-2"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Gauge className="w-5 h-5" />
              <span className="text-xs font-medium">Показания</span>
            </motion.div>
            <p className="text-sm mb-1 font-semibold">Передать показания</p>
            <p className="text-xs opacity-90 mb-3">За {new Date().toLocaleDateString('ru-RU', { month: 'long' })}</p>
            <motion.button
              onClick={onNavigateToMeters}
              className="w-full bg-white text-blue-600 py-2.5 px-4 rounded-2xl text-sm font-bold hover:bg-blue-50 transition-colors shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Передать ⚡
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Section Header */}
      <motion.div 
        className="flex items-center gap-3 mt-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
          <Bell className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Объявления</h2>
          <p className="text-xs text-gray-600">Актуальная информация для вас</p>
        </div>
      </motion.div>

      {/* Announcements with Modern Cards */}
      <div className="space-y-4">
        {userAnnouncements.map((announcement, index) => {
          const config = typeConfig[announcement.type];
          const Icon = config.icon;
          const ServiceIcon = serviceIcons[announcement.service];

          return (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -3, scale: 1.01 }}
              className="relative"
            >
              <Card className={`relative overflow-hidden border-0 shadow-lg bg-white hover:shadow-xl transition-shadow`}>
                {/* Gradient accent bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  announcement.type === 'urgent' ? 'bg-gradient-to-b from-red-500 to-pink-500' :
                  announcement.type === 'warning' ? 'bg-gradient-to-b from-orange-500 to-yellow-500' :
                  'bg-gradient-to-b from-blue-500 to-indigo-500'
                }`} />
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Icon with gradient background */}
                      <motion.div 
                        className={`p-3 rounded-2xl shadow-md ${
                          announcement.type === 'urgent' ? 'bg-gradient-to-br from-red-500 to-pink-500' :
                          announcement.type === 'warning' ? 'bg-gradient-to-br from-orange-500 to-yellow-500' :
                          'bg-gradient-to-br from-blue-500 to-indigo-500'
                        } text-white`}
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Icon className="w-5 h-5" />
                      </motion.div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-sm ${
                              announcement.type === 'urgent' ? 'bg-red-50 text-red-700' :
                              announcement.type === 'warning' ? 'bg-orange-50 text-orange-700' :
                              'bg-blue-50 text-blue-700'
                            }`}
                          >
                            <ServiceIcon className="w-3.5 h-3.5" />
                            <span className="text-xs font-semibold">{config.label}</span>
                          </motion.div>
                        </div>
                        <CardTitle className="text-base font-bold mb-1 text-gray-900">
                          {announcement.title}
                        </CardTitle>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    {announcement.message}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
                    <p className="text-xs text-gray-500 font-medium">
                      {new Date(announcement.date).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {userAnnouncements.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-12 text-center shadow-lg"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-16 h-16 mx-auto text-blue-500 mb-4" />
          </motion.div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Пока нет объявлений</h3>
          <p className="text-gray-600">Новые уведомления появятся здесь</p>
        </motion.div>
      )}
    </div>
  );
}