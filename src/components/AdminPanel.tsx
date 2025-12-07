import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Users, Calendar, CheckCircle, Clock, Filter, Search, TrendingUp, Award, LayoutDashboard, Settings, Bell, BarChart3, FileCheck, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

interface MeterReading {
  id: string;
  userName: string;
  userPhone: string;
  address: string;
  accountNumber: string;
  meterType: 'cold_water' | 'hot_water' | 'heating';
  meterNumber: string;
  reading: number;
  unit: string;
  submissionDate: string;
  verificationDate: string;
  status: 'submitted' | 'accepted' | 'rejected';
}

// Моковые данные с несколькими пользователями
const mockAdminData: MeterReading[] = [
  // Пользователь 1
  {
    id: '1',
    userName: 'Иванов Иван Иванович',
    userPhone: '+7 912 345-67-89',
    address: 'г. Талица, ул. Ленина, д. 15, кв. 23',
    accountNumber: '1234567890',
    meterType: 'cold_water',
    meterNumber: '12345678',
    reading: 1234,
    unit: 'м³',
    submissionDate: '2025-11-20',
    verificationDate: '2024-03-15',
    status: 'accepted'
  },
  {
    id: '2',
    userName: 'Иванов Иван Иванович',
    userPhone: '+7 912 345-67-89',
    address: 'г. Талица, ул. Ленина, д. 15, кв. 23',
    accountNumber: '1234567890',
    meterType: 'hot_water',
    meterNumber: '87654321',
    reading: 856,
    unit: 'м³',
    submissionDate: '2025-11-20',
    verificationDate: '2024-05-20',
    status: 'accepted'
  },
  {
    id: '3',
    userName: 'Иванов Иван Иванович',
    userPhone: '+7 912 345-67-89',
    address: 'г. Талица, ул. Ленина, д. 15, кв. 23',
    accountNumber: '1234567890',
    meterType: 'heating',
    meterNumber: '11223344',
    reading: 2.45,
    unit: 'Гкал',
    submissionDate: '2025-11-20',
    verificationDate: '2023-11-10',
    status: 'accepted'
  },
  // Пользователь 2
  {
    id: '4',
    userName: 'Петрова Мария Сергеевна',
    userPhone: '+7 922 111-22-33',
    address: 'с. Троицкое, ул. Советская, д. 8, кв. 5',
    accountNumber: '0987654321',
    meterType: 'cold_water',
    meterNumber: '22334455',
    reading: 987,
    unit: 'м³',
    submissionDate: '2025-11-21',
    verificationDate: '2024-01-10',
    status: 'submitted'
  },
  {
    id: '5',
    userName: 'Петрова Мария Сергеевна',
    userPhone: '+7 922 111-22-33',
    address: 'с. Троицкое, ул. Советская, д. 8, кв. 5',
    accountNumber: '0987654321',
    meterType: 'hot_water',
    meterNumber: '55443322',
    reading: 654,
    unit: 'м³',
    submissionDate: '2025-11-21',
    verificationDate: '2024-02-15',
    status: 'submitted'
  },
  {
    id: '6',
    userName: 'Петрова Мария Сергеевна',
    userPhone: '+7 922 111-22-33',
    address: 'с. Троицкое, ул. Советская, д. 8, кв. 5',
    accountNumber: '0987654321',
    meterType: 'heating',
    meterNumber: '66778899',
    reading: 3.21,
    unit: 'Гкал',
    submissionDate: '2025-11-21',
    verificationDate: '2023-12-20',
    status: 'submitted'
  },
  // Пользователь 3
  {
    id: '7',
    userName: 'Сидоров Петр Алексеевич',
    userPhone: '+7 912 999-88-77',
    address: 'г. Талица, ул. Гагарина, д. 42, кв. 101',
    accountNumber: '1122334455',
    meterType: 'cold_water',
    meterNumber: '99887766',
    reading: 1567,
    unit: 'м³',
    submissionDate: '2025-11-22',
    verificationDate: '2024-06-05',
    status: 'accepted'
  },
  {
    id: '8',
    userName: 'Сидоров Петр Алексеевич',
    userPhone: '+7 912 999-88-77',
    address: 'г. Талица, ул. Гагарина, д. 42, кв. 101',
    accountNumber: '1122334455',
    meterType: 'hot_water',
    meterNumber: '55667788',
    reading: 1023,
    unit: 'м³',
    submissionDate: '2025-11-22',
    verificationDate: '2024-07-12',
    status: 'accepted'
  },
  {
    id: '9',
    userName: 'Сидоров Петр Алексеевич',
    userPhone: '+7 912 999-88-77',
    address: 'г. Талица, ул. Гагарина, д. 42, кв. 101',
    accountNumber: '1122334455',
    meterType: 'heating',
    meterNumber: '33445566',
    reading: 4.56,
    unit: 'Гкал',
    submissionDate: '2025-11-22',
    verificationDate: '2023-10-15',
    status: 'accepted'
  },
  // Пользователь 4
  {
    id: '10',
    userName: 'Козлова Анна Владимировна',
    userPhone: '+7 922 555-44-33',
    address: 'с. Пристань, ул. Центральная, д. 3',
    accountNumber: '5544332211',
    meterType: 'cold_water',
    meterNumber: '11112222',
    reading: 2345,
    unit: 'м³',
    submissionDate: '2025-11-23',
    verificationDate: '2024-04-20',
    status: 'submitted'
  },
  {
    id: '11',
    userName: 'Козлова Анна Владимировна',
    userPhone: '+7 922 555-44-33',
    address: 'с. Пристань, ул. Центральная, д. 3',
    accountNumber: '5544332211',
    meterType: 'hot_water',
    meterNumber: '33334444',
    reading: 1678,
    unit: 'м³',
    submissionDate: '2025-11-23',
    verificationDate: '2024-05-25',
    status: 'submitted'
  },
  {
    id: '12',
    userName: 'Козлова Анна Владимировна',
    userPhone: '+7 922 555-44-33',
    address: 'с. Пристань, ул. Центральная, д. 3',
    accountNumber: '5544332211',
    meterType: 'heating',
    meterNumber: '55556666',
    reading: 1.89,
    unit: 'Гкал',
    submissionDate: '2025-11-23',
    verificationDate: '2023-09-10',
    status: 'submitted'
  }
];

const meterTypeLabels = {
  cold_water: { label: 'Холодная вода', emoji: '💧', color: 'from-blue-500 to-cyan-500' },
  hot_water: { label: 'Горячая вода', emoji: '🔥', color: 'from-red-500 to-orange-500' },
  heating: { label: 'Отопление', emoji: '♨️', color: 'from-orange-500 to-yellow-500' }
};

type AdminTab = 'dashboard' | 'meters' | 'statistics' | 'settings';

interface AdminPanelProps {
  onLogout: () => void;
}

export function AdminPanel({ onLogout }: AdminPanelProps) {
  const [readings] = useState<MeterReading[]>(mockAdminData);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'submitted' | 'accepted' | 'rejected'>('all');
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const filteredReadings = readings.filter(reading => {
    const matchesSearch = 
      reading.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reading.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reading.accountNumber.includes(searchQuery) ||
      reading.meterNumber.includes(searchQuery);
    
    const matchesStatus = filterStatus === 'all' || reading.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: readings.length,
    submitted: readings.filter(r => r.status === 'submitted').length,
    accepted: readings.filter(r => r.status === 'accepted').length,
    users: new Set(readings.map(r => r.accountNumber)).size
  };

  const exportToCSV = () => {
    const headers = [
      'ФИО',
      'Телефон',
      'Адрес',
      'Лицевой счет',
      'Тип счетчика',
      'Номер счетчика',
      'Показания',
      'Единица измерения',
      'Дата передачи',
      'Дата поверки',
      'Статус'
    ];

    const rows = filteredReadings.map(reading => [
      reading.userName,
      reading.userPhone,
      reading.address,
      reading.accountNumber,
      meterTypeLabels[reading.meterType].label,
      reading.meterNumber,
      reading.reading.toString(),
      reading.unit,
      new Date(reading.submissionDate).toLocaleDateString('ru-RU'),
      new Date(reading.verificationDate).toLocaleDateString('ru-RU'),
      reading.status === 'accepted' ? 'Принято' : reading.status === 'submitted' ? 'На проверке' : 'Отклонено'
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';'))
    ].join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pokazaniya_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = async () => {
    // Используем динамический импорт для xlsx
    const XLSX = await import('xlsx');
    
    const data = filteredReadings.map(reading => ({
      'ФИО': reading.userName,
      'Телефон': reading.userPhone,
      'Адрес': reading.address,
      'Лицевой счет': reading.accountNumber,
      'Тип счетчика': meterTypeLabels[reading.meterType].label,
      'Номер счетчика': reading.meterNumber,
      'Показания': reading.reading,
      'Единица измерения': reading.unit,
      'Дата передачи': new Date(reading.submissionDate).toLocaleDateString('ru-RU'),
      'Дата поверки': new Date(reading.verificationDate).toLocaleDateString('ru-RU'),
      'Статус': reading.status === 'accepted' ? 'Принято' : reading.status === 'submitted' ? 'На проверке' : 'Отклонено'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Показания');

    // Автоширина колонок
    const maxWidth = data.reduce((w, r) => Math.max(w, r['Адрес'].length), 10);
    worksheet['!cols'] = [
      { wch: 25 }, // ФИО
      { wch: 18 }, // Телефон
      { wch: maxWidth }, // Адрес
      { wch: 15 }, // Лицевой счет
      { wch: 18 }, // Тип счетчика
      { wch: 18 }, // Номер счетчика
      { wch: 12 }, // Показания
      { wch: 12 }, // Единица
      { wch: 15 }, // Дата передачи
      { wch: 15 }, // Дата поверки
      { wch: 12 }  // Статус
    ];

    XLSX.writeFile(workbook, `pokazaniya_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Menu items
  const menuItems = [
    { id: 'dashboard' as AdminTab, icon: LayoutDashboard, label: 'Дашборд', badge: null },
    { id: 'meters' as AdminTab, icon: FileCheck, label: 'Показания счетчиков', badge: stats.submitted },
    { id: 'statistics' as AdminTab, icon: BarChart3, label: 'Статистика', badge: null },
    { id: 'settings' as AdminTab, icon: Settings, label: 'Настройки', badge: null },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className={`${
          isSidebarCollapsed ? 'w-20' : 'w-72'
        } bg-gradient-to-b from-purple-700 via-purple-600 to-pink-600 shadow-2xl transition-all duration-300 flex flex-col relative z-10`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <motion.div 
            className="flex items-center gap-3"
            animate={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start' }}
          >
            <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <AnimatePresence>
              {!isSidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden"
                >
                  <h2 className="font-bold text-white">Админ-панель</h2>
                  <p className="text-xs text-white/70">Управление системой</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative ${
                activeTab === item.id
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${
                activeTab === item.id ? 'text-purple-600' : 'text-white'
              }`} />
              
              <AnimatePresence>
                {!isSidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="font-medium overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {item.badge && item.badge > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === item.id
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {item.badge}
                </motion.span>
              )}
            </motion.button>
          ))}
        </nav>

        {/* User info and logout at bottom */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <motion.div 
            className={`flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm ${
              isSidebarCollapsed ? 'justify-center' : ''
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white font-bold">
              A
            </div>
            <AnimatePresence>
              {!isSidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex-1 overflow-hidden"
                >
                  <p className="text-sm font-medium text-white">Администратор</p>
                  <p className="text-xs text-white/70">admin@example.com</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          {/* Logout button */}
          <motion.button
            onClick={onLogout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-white transition-all ${
              isSidebarCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {!isSidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-medium overflow-hidden whitespace-nowrap"
                >
                  Выход
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Collapse button */}
        <motion.button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-4 top-20 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-purple-600 hover:bg-purple-50 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            animate={{ rotate: isSidebarCollapsed ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.div>
        </motion.button>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6 pb-8">
          {/* Header */}
          <motion.div 
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {activeTab === 'dashboard' && 'Дашборд'}
                {activeTab === 'meters' && 'Показания счетчиков'}
                {activeTab === 'statistics' && 'Статистика'}
                {activeTab === 'settings' && 'Настройки'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {activeTab === 'dashboard' && 'Обзор системы и ключевые метрики'}
                {activeTab === 'meters' && 'Управление показаниями приборов учета'}
                {activeTab === 'statistics' && 'Аналитика и отчеты'}
                {activeTab === 'settings' && 'Настройки системы'}
              </p>
            </div>
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow relative"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          className="relative overflow-hidden rounded-2xl shadow-lg"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600" />
          <div className="relative p-4 text-white">
            <TrendingUp className="w-5 h-5 mb-2 opacity-80" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs opacity-90">Всего показаний</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.05 }}
          className="relative overflow-hidden rounded-2xl shadow-lg"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-yellow-500" />
          <div className="relative p-4 text-white">
            <Clock className="w-5 h-5 mb-2 opacity-80" />
            <p className="text-2xl font-bold">{stats.submitted}</p>
            <p className="text-xs opacity-90">На проверке</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          className="relative overflow-hidden rounded-2xl shadow-lg"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600" />
          <div className="relative p-4 text-white">
            <CheckCircle className="w-5 h-5 mb-2 opacity-80" />
            <p className="text-2xl font-bold">{stats.accepted}</p>
            <p className="text-xs opacity-90">Принято</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          className="relative overflow-hidden rounded-2xl shadow-lg"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600" />
          <div className="relative p-4 text-white">
            <Users className="w-5 h-5 mb-2 opacity-80" />
            <p className="text-2xl font-bold">{stats.users}</p>
            <p className="text-xs opacity-90">Пользователей</p>
          </div>
        </motion.div>
      </div>



                {/* Summary Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">
                          📊 Показано записей: <span className="font-bold text-gray-900">{filteredReadings.length}</span> из {readings.length}
                        </span>
                        <span className="text-gray-600">
                          Последнее обновление: {new Date().toLocaleString('ru-RU')}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'meters' && (
              <motion.div
                key="meters"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Actions Bar */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            type="text"
                            placeholder="Поиск по ФИО, адресу, лицевому счету..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 rounded-xl border-2 border-gray-200 focus:border-purple-400"
                          />
                        </div>

                        {/* Filter */}
                        <div className="flex gap-2 flex-wrap">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilterStatus('all')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                              filterStatus === 'all'
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            Все
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilterStatus('submitted')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                              filterStatus === 'submitted'
                                ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            На проверке
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilterStatus('accepted')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                              filterStatus === 'accepted'
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            Принято
                          </motion.button>
                        </div>

                        {/* Export Buttons */}
                        <div className="flex gap-2">
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              onClick={exportToExcel}
                              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg"
                            >
                              <FileSpreadsheet className="w-4 h-4 mr-2" />
                              Excel
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              onClick={exportToCSV}
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg"
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              CSV
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Readings Table */}
                <motion.div className="space-y-3">
                  {filteredReadings.length === 0 ? (
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-12 text-center">
                        <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Ничего не найдено</h3>
                        <p className="text-gray-600">Попробуйте изменить параметры поиска</p>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredReadings.map((reading, index) => {
                      const meterConfig = meterTypeLabels[reading.meterType];
                      
                      return (
                        <motion.div
                          key={reading.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.01, y: -2 }}
                        >
                          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                            {/* Gradient accent */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${meterConfig.color}`} />
                            
                            <CardContent className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                {/* User Info */}
                                <div className="md:col-span-3">
                                  <p className="font-bold text-gray-900">{reading.userName}</p>
                                  <p className="text-xs text-gray-600">{reading.userPhone}</p>
                                  <p className="text-xs text-gray-500 mt-1">{reading.address}</p>
                                </div>

                                {/* Account */}
                                <div className="md:col-span-2">
                                  <p className="text-xs text-gray-500">Лицевой счет</p>
                                  <p className="font-medium text-gray-900">{reading.accountNumber}</p>
                                </div>

                                {/* Meter Info */}
                                <div className="md:col-span-3">
                                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r ${meterConfig.color} bg-opacity-10 mb-2`}>
                                    <span>{meterConfig.emoji}</span>
                                    <span className="text-xs font-semibold text-gray-900">{meterConfig.label}</span>
                                  </div>
                                  <p className="text-xs text-gray-600">№ {reading.meterNumber}</p>
                                  <p className="text-xs text-gray-500">
                                    <Calendar className="w-3 h-3 inline mr-1" />
                                    Поверка: {new Date(reading.verificationDate).toLocaleDateString('ru-RU')}
                                  </p>
                                </div>

                                {/* Reading */}
                                <div className="md:col-span-2">
                                  <p className="text-xs text-gray-500">Показания</p>
                                  <p className="text-xl font-bold text-gray-900">
                                    {reading.reading} <span className="text-sm text-gray-600">{reading.unit}</span>
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(reading.submissionDate).toLocaleDateString('ru-RU')}
                                  </p>
                                </div>

                                {/* Status */}
                                <div className="md:col-span-2 flex justify-end">
                                  <Badge
                                    className={`${
                                      reading.status === 'accepted'
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                        : reading.status === 'submitted'
                                        ? 'bg-gradient-to-r from-orange-500 to-yellow-500'
                                        : 'bg-gradient-to-r from-red-500 to-pink-500'
                                    } text-white border-0 shadow-md`}
                                  >
                                    {reading.status === 'accepted' && (
                                      <>
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Принято
                                      </>
                                    )}
                                    {reading.status === 'submitted' && (
                                      <>
                                        <Clock className="w-3 h-3 mr-1" />
                                        На проверке
                                      </>
                                    )}
                                    {reading.status === 'rejected' && 'Отклонено'}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })
                  )}
                </motion.div>

                {/* Summary */}
                <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">
                        📊 Показано записей: <span className="font-bold text-gray-900">{filteredReadings.length}</span> из {readings.length}
                      </span>
                      <span className="text-gray-600">
                        Последнее обновление: {new Date().toLocaleString('ru-RU')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'statistics' && (
              <motion.div
                key="statistics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-12 text-center">
                    <BarChart3 className="w-20 h-20 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Статистика</h3>
                    <p className="text-gray-600">Раздел в разработке</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-12 text-center">
                    <Settings className="w-20 h-20 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Настройки</h3>
                    <p className="text-gray-600">Раздел в разработке</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
