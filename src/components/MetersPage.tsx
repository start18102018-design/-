import { useState } from 'react';
import { Gauge, Droplets, Flame, Calendar, CheckCircle, AlertCircle, Trophy, Zap, TrendingUp, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import type { User } from '../App';

interface MeterReading {
  id: string;
  type: 'cold_water' | 'hot_water' | 'heating';
  value: number;
  date: string;
  status: 'submitted' | 'accepted';
}

interface MetersPageProps {
  user: User;
}

const mockReadings: MeterReading[] = [
  {
    id: '1',
    type: 'cold_water',
    value: 1234,
    date: '2025-10-15',
    status: 'accepted'
  },
  {
    id: '2',
    type: 'hot_water',
    value: 856,
    date: '2025-10-15',
    status: 'accepted'
  },
  {
    id: '3',
    type: 'heating',
    value: 2.45,
    date: '2025-10-15',
    status: 'accepted'
  }
];

const meterTypes = {
  cold_water: {
    label: 'Холодная вода',
    icon: Droplets,
    color: 'from-blue-400 to-cyan-500',
    textColor: 'text-blue-600',
    bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    unit: 'м³',
    meterNumber: '12345678',
    verificationDate: '2024-03-15',
    emoji: '💧'
  },
  hot_water: {
    label: 'Горячая вода',
    icon: Droplets,
    color: 'from-red-400 to-orange-500',
    textColor: 'text-red-600',
    bgColor: 'bg-gradient-to-br from-red-50 to-orange-50',
    unit: 'м³',
    meterNumber: '87654321',
    verificationDate: '2024-05-20',
    emoji: '🔥'
  },
  heating: {
    label: 'Тепловая энергия',
    icon: Flame,
    color: 'from-orange-400 to-yellow-500',
    textColor: 'text-orange-600',
    bgColor: 'bg-gradient-to-br from-orange-50 to-yellow-50',
    unit: 'Гкал',
    meterNumber: '11223344',
    verificationDate: '2023-11-10',
    emoji: '♨️'
  }
};

export function MetersPage({ user }: MetersPageProps) {
  const [readings, setReadings] = useState<MeterReading[]>(mockReadings);
  const [newReadings, setNewReadings] = useState({
    cold_water: '',
    hot_water: '',
    heating: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [streak, setStreak] = useState(3); // Количество месяцев подряд

  const lastReadings = {
    cold_water: readings.find(r => r.type === 'cold_water')?.value || 0,
    hot_water: readings.find(r => r.type === 'hot_water')?.value || 0,
    heating: readings.find(r => r.type === 'heating')?.value || 0
  };

  const canSubmitThisMonth = () => {
    const now = new Date();
    const lastReading = readings[0];
    if (!lastReading) return true;
    
    const lastDate = new Date(lastReading.date);
    return now.getMonth() !== lastDate.getMonth() || now.getFullYear() !== lastDate.getFullYear();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canSubmitThisMonth()) {
      return;
    }

    const hasAllReadings = newReadings.cold_water && newReadings.hot_water && newReadings.heating;
    if (!hasAllReadings) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const today = new Date().toISOString().split('T')[0];
      const newEntries: MeterReading[] = [
        {
          id: `${Date.now()}-1`,
          type: 'cold_water',
          value: parseFloat(newReadings.cold_water),
          date: today,
          status: 'submitted'
        },
        {
          id: `${Date.now()}-2`,
          type: 'hot_water',
          value: parseFloat(newReadings.hot_water),
          date: today,
          status: 'submitted'
        },
        {
          id: `${Date.now()}-3`,
          type: 'heating',
          value: parseFloat(newReadings.heating),
          date: today,
          status: 'submitted'
        }
      ];

      setReadings([...newEntries, ...readings]);
      setNewReadings({ cold_water: '', hot_water: '', heating: '' });
      setIsSubmitting(false);
      setShowSuccess(true);
      setStreak(streak + 1);
      
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto px-3 py-4 sm:px-4 sm:py-6 space-y-4 sm:space-y-6 pb-6 sm:pb-8">
      {/* Success Celebration Animation */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -100 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 1, repeat: 3 }}
              className="glass rounded-3xl p-8 text-center"
            >
              <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold gradient-text mb-2">Отлично! 🎉</h3>
              <p className="text-gray-700">Показания приняты</p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <Zap className="w-5 h-5 text-purple-500" />
                <span className="font-bold text-purple-600">{streak} месяцев подряд!</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
            <Gauge className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Показания счетчиков</h2>
            <p className="text-xs text-gray-600">Передавайте вовремя и зарабатывайте баллы!</p>
          </div>
        </div>

        {/* Streak Badge */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="flex flex-col items-center gap-1 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-3 text-white shadow-lg"
        >
          <Award className="w-5 h-5" />
          <span className="text-xs font-bold">{streak} мес.</span>
        </motion.div>
      </motion.div>

      {/* Address Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-4 border border-blue-100 shadow-md"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">📍 Адрес:</span>
          <span className="font-medium text-gray-900">{user.address}</span>
        </div>
      </motion.div>

      {/* Submit Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
          <CardHeader className="bg-gradient-to-br from-blue-50 to-purple-50">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Передать показания за {new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
            </CardTitle>
            <CardDescription>
              📅 Показания принимаются с 20 по 25 число каждого месяца
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {(Object.keys(meterTypes) as Array<keyof typeof meterTypes>).map((meterType, index) => {
                const config = meterTypes[meterType];
                const Icon = config.icon;
                const lastValue = lastReadings[meterType];

                return (
                  <motion.div
                    key={meterType}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className={`${config.bgColor} p-4 rounded-2xl border-2 border-transparent hover:border-purple-300 transition-all`}
                  >
                    <Label htmlFor={meterType} className="flex items-center gap-2 mb-3">
                      <div className={`p-2 bg-gradient-to-br ${config.color} rounded-xl`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-bold">{config.emoji} {config.label}</span>
                    </Label>
                    
                    <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl text-xs text-gray-600 mb-3 space-y-1">
                      <div className="flex justify-between">
                        <span>№ счетчика:</span>
                        <span className="font-medium text-gray-900">{config.meterNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Дата поверки:</span>
                        <span className="font-medium text-gray-900">
                          {new Date(config.verificationDate).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Input
                        id={meterType}
                        type="number"
                        step={meterType === 'heating' ? '0.01' : '1'}
                        placeholder={`Введите показания`}
                        value={newReadings[meterType]}
                        onChange={(e) => setNewReadings({ ...newReadings, [meterType]: e.target.value })}
                        disabled={isSubmitting}
                        className="flex-1 border-2 border-gray-200 focus:border-purple-400 rounded-xl"
                      />
                      <span className="text-sm font-medium text-gray-600 whitespace-nowrap px-3 py-2 bg-white rounded-xl">
                        {config.unit}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Предыдущие: <span className="font-medium">{lastValue} {config.unit}</span>
                    </p>
                  </motion.div>
                );
              })}

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 rounded-2xl shadow-lg"
                  disabled={isSubmitting || !canSubmitThisMonth()}
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Zap className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Отправить показания
                    </>
                  )}
                </Button>
              </motion.div>

              {!canSubmitThisMonth() && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 bg-gradient-to-r from-orange-100 to-yellow-100 p-4 rounded-2xl border-2 border-orange-200"
                >
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <span className="text-sm text-orange-800 font-medium">
                    ✅ Показания за текущий месяц уже отправлены
                  </span>
                </motion.div>
              )}
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
          <h3 className="font-semibold text-gray-600">📚 История показаний</h3>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
        </div>

        {readings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-12 text-center"
          >
            <Gauge className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">История показаний пуста</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {Object.entries(
              readings.reduce((acc, reading) => {
                const month = new Date(reading.date).toLocaleDateString('ru-RU', {
                  month: 'long',
                  year: 'numeric'
                });
                if (!acc[month]) acc[month] = [];
                acc[month].push(reading);
                return acc;
              }, {} as Record<string, MeterReading[]>)
            ).map(([month, monthReadings], idx) => (
              <motion.div
                key={month}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="border-0 shadow-lg overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-bold text-gray-800">📅 {month}</CardTitle>
                      <motion.div whileHover={{ scale: 1.1 }}>
                        <Badge
                          className={`${
                            monthReadings[0].status === 'accepted'
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                              : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                          } text-white border-0`}
                        >
                          {monthReadings[0].status === 'accepted' ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Принято ✓
                            </>
                          ) : (
                            '⏳ На проверке'
                          )}
                        </Badge>
                      </motion.div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-2">
                    {monthReadings.map((reading) => {
                      const config = meterTypes[reading.type];
                      const Icon = config.icon;
                      return (
                        <motion.div
                          key={reading.id}
                          whileHover={{ x: 5 }}
                          className={`flex items-center justify-between p-3 rounded-xl ${config.bgColor} border border-gray-100`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 bg-gradient-to-br ${config.color} rounded-lg`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-medium">{config.emoji} {config.label}</span>
                          </div>
                          <span className="font-bold text-gray-900">
                            {reading.value} {config.unit}
                          </span>
                        </motion.div>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}