import { useState } from 'react';
import { Shield, Upload, MessageCircle, Bell, Users, BarChart, LogOut, Settings, CreditCard, Home, Wrench, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { AdminReceiptsUpload } from './AdminReceiptsUpload';
import { AdminQAManagement } from './AdminQAManagement';
import { AdminAnnouncements } from './AdminAnnouncements';
import { AdminUsers } from './AdminUsers';
import { AdminStats } from './AdminStats';
import { AdminManagement } from './AdminManagement';
import { PaymentSettings } from './PaymentSettings';
import { AdminAccounts } from './AdminAccounts';
import { AdminRequests } from './AdminRequests';

interface AdminPanelProps {
  onLogout: () => void;
}

type AdminTab = 'stats' | 'receipts' | 'qa' | 'announcements' | 'users' | 'accounts' | 'admins' | 'payment' | 'requests';

export function AdminPanel({ onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('stats');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Menu items configuration
  const menuItems = [
    { id: 'stats' as AdminTab, icon: BarChart, label: 'Статистика' },
    { id: 'receipts' as AdminTab, icon: Upload, label: 'Загрузка квитанций' },
    { id: 'qa' as AdminTab, icon: MessageCircle, label: 'Вопросы-Ответы' },
    { id: 'announcements' as AdminTab, icon: Bell, label: 'Объявления' },
    { id: 'users' as AdminTab, icon: Users, label: 'Пользователи' },
    { id: 'accounts' as AdminTab, icon: CreditCard, label: 'Лицевые счета' },
    { id: 'requests' as AdminTab, icon: Wrench, label: 'Заявки на ремонт' },
    { id: 'admins' as AdminTab, icon: Shield, label: 'Управление админами' },
    { id: 'payment' as AdminTab, icon: Settings, label: 'Настройки оплаты' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Mobile First: Hidden on mobile, shown on tablet+ */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0, width: isSidebarCollapsed ? '80px' : '280px' }}
        transition={{ duration: 0.3 }}
        className="hidden md:flex bg-gradient-to-b from-purple-700 via-purple-600 to-indigo-700 shadow-2xl flex-col relative z-10"
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <motion.div 
            className="flex items-center gap-3"
            animate={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start' }}
          >
            <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <AnimatePresence>
              {!isSidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden"
                >
                  <h2 className="font-bold text-white whitespace-nowrap">Админ-панель</h2>
                  <p className="text-xs text-white/70 whitespace-nowrap">Управление системой</p>
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
              transition={{ delay: index * 0.05 }}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative ${
                activeTab === item.id
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
              title={isSidebarCollapsed ? item.label : undefined}
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
                    className="font-medium overflow-hidden whitespace-nowrap text-sm"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {activeTab === item.id && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
                />
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white font-bold flex-shrink-0">
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
                  <p className="text-sm font-medium text-white whitespace-nowrap">Администратор</p>
                  <p className="text-xs text-white/70 whitespace-nowrap">admin@example.com</p>
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
            title={isSidebarCollapsed ? 'Выход' : undefined}
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
            animate={{ rotate: isSidebarCollapsed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.div>
        </motion.button>
      </motion.aside>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex overflow-x-auto scrollbar-hide">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 min-w-[80px] flex flex-col items-center gap-1 py-2 px-2 transition-all ${
                activeTab === item.id
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-600'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] leading-tight text-center">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content - Mobile First */}
      <main className="flex-1 overflow-y-auto bg-gray-50 pb-16 md:pb-0">
        <div className="px-3 py-4 sm:px-4 sm:py-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
          {/* Page Header - Mobile Optimized */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start justify-between gap-2"
          >
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">
                {menuItems.find(item => item.id === activeTab)?.label}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                Управление и настройка раздела
              </p>
            </div>
            {/* Mobile Logout Button */}
            <button
              onClick={onLogout}
              className="md:hidden flex-shrink-0 p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              title="Выход"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </motion.div>

          {/* Content Area */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'stats' && <AdminStats />}
              {activeTab === 'receipts' && <AdminReceiptsUpload />}
              {activeTab === 'qa' && <AdminQAManagement />}
              {activeTab === 'announcements' && <AdminAnnouncements />}
              {activeTab === 'users' && <AdminUsers />}
              {activeTab === 'admins' && <AdminManagement />}
              {activeTab === 'payment' && <PaymentSettings />}
              {activeTab === 'accounts' && <AdminAccounts />}
              {activeTab === 'requests' && <AdminRequests />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}