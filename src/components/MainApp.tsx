import { useState } from 'react';
import { Home, MessageCircle, User as UserIcon, Gauge, FileText, Wrench, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import logoImage from 'figma:asset/981709ddc4b678b21b8b53259fdf071f747bc704.png';
import { AnnouncementsPage } from './AnnouncementsPage';
import { QAPage } from './QAPage';
import { ProfilePage } from './ProfilePage';
import { MetersPage } from './MetersPage';
import { ReceiptsPage } from './ReceiptsPage';
import { PaymentPage } from './PaymentPage';
import { RequestsPage } from './RequestsPage';
import type { User } from '../App';

interface MainAppProps {
  user: User;
  onLogout: () => void;
}

type Tab = 'announcements' | 'qa' | 'meters' | 'receipts' | 'profile' | 'payment' | 'requests';

export function MainApp({ user, onLogout }: MainAppProps) {
  const [activeTab, setActiveTab] = useState<Tab>('announcements');
  const [paymentData, setPaymentData] = useState<{ amount: number; period: string } | null>(null);
  const [currentUser, setCurrentUser] = useState<User>(user);

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  const handleNavigateToPayment = (amount?: number, period?: string) => {
    setPaymentData({
      amount: amount || 1250.50,
      period: period || 'Задолженность'
    });
    setActiveTab('payment');
  };

  const handleBackFromPayment = () => {
    setActiveTab('receipts');
    setPaymentData(null);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated background particles - lighter and subtle - Mobile optimized */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-32 sm:w-64 h-32 sm:h-64 bg-blue-400/10 rounded-full blur-2xl sm:blur-3xl float-animation" />
        <div className="absolute top-20 sm:top-40 right-5 sm:right-10 w-40 sm:w-80 h-40 sm:h-80 bg-indigo-400/10 rounded-full blur-2xl sm:blur-3xl float-animation" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 sm:bottom-40 left-1/4 w-36 sm:w-72 h-36 sm:h-72 bg-purple-400/10 rounded-full blur-2xl sm:blur-3xl float-animation" style={{ animationDelay: '4s' }} />
      </div>

      {/* Glassmorphic Header with Gradient - Mobile First */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass relative z-10 backdrop-blur-2xl shadow-xl border-b border-blue-100"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 opacity-95" />
        <div className="max-w-2xl mx-auto px-4 py-4 sm:px-6 sm:py-6 relative z-10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              {/* Animated Logo */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                whileHover={{ scale: 1.1, rotate: 360 }}
                className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white shadow-xl p-1.5 sm:p-2 flex items-center justify-center flex-shrink-0"
              >
                <ImageWithFallback
                  src={logoImage}
                  alt="ТВР Логотип"
                  className="w-full h-full object-contain"
                />
              </motion.div>
              
              <div className="min-w-0 flex-1">
                <motion.h1 
                  className="text-base sm:text-xl md:text-2xl font-bold text-white flex items-center gap-2 truncate"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <span className="hidden sm:inline">Коммунальные сервисы</span>
                  <span className="sm:hidden">Ком. сервисы</span>
                </motion.h1>
                <motion.p 
                  className="text-xs sm:text-sm text-blue-100 mt-0.5 sm:mt-1 truncate"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="hidden sm:inline">Привет, </span>
                  <span className="font-semibold text-white">{user.name}</span>! 👋
                </motion.p>
              </div>
            </div>
            <motion.div
              className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xl border-2 border-white/20 flex-shrink-0"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-lg sm:text-2xl font-bold">{user.name.charAt(0)}</span>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Content with page transitions - Mobile optimized padding */}
      <main className="flex-1 overflow-auto pb-20 sm:pb-24 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'announcements' && (
              <AnnouncementsPage 
                onNavigateToMeters={() => setActiveTab('meters')}
                onNavigateToPayment={() => handleNavigateToPayment()}
                userSettlement={user.settlement}
              />
            )}
            {activeTab === 'qa' && <QAPage user={user} />}
            {activeTab === 'meters' && <MetersPage user={user} />}
            {activeTab === 'receipts' && (
              <ReceiptsPage 
                user={user} 
                onNavigateToPayment={handleNavigateToPayment}
              />
            )}
            {activeTab === 'profile' && (
              <ProfilePage 
                user={currentUser} 
                onLogout={onLogout}
                onNavigateToReceipts={() => setActiveTab('receipts')}
                onNavigateToPayment={() => handleNavigateToPayment()}
                onUpdateUser={handleUpdateUser}
              />
            )}
            {activeTab === 'payment' && paymentData && (
              <PaymentPage
                user={user}
                amount={paymentData.amount}
                period={paymentData.period}
                onBack={handleBackFromPayment}
              />
            )}
            {activeTab === 'requests' && <RequestsPage user={user} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Glassmorphic Bottom Navigation - Mobile First */}
      {activeTab !== 'payment' && (
        <motion.nav 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 z-50"
        >
          <div className="max-w-2xl mx-auto glass rounded-2xl sm:rounded-3xl shadow-2xl p-1.5 sm:p-2">
            <div className="flex justify-around items-center">
              {[
                { id: 'announcements', icon: Home, label: 'Главная' },
                { id: 'meters', icon: Gauge, label: 'Счетчики' },
                { id: 'receipts', icon: FileText, label: 'Счета' },
                { id: 'qa', icon: MessageCircle, label: 'Помощь' },
                { id: 'profile', icon: UserIcon, label: 'Профиль' },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className="relative flex-1 flex flex-col items-center gap-0.5 sm:gap-1 py-2 sm:py-3 px-1 sm:px-2 rounded-xl sm:rounded-2xl transition-all min-w-0"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl sm:rounded-2xl"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <tab.icon 
                    className={`w-5 h-5 sm:w-6 sm:h-6 relative z-10 transition-colors flex-shrink-0 ${
                      activeTab === tab.id
                        ? 'text-purple-600'
                        : 'text-gray-500'
                    }`} 
                  />
                  <span className={`text-[10px] sm:text-xs relative z-10 font-medium transition-colors leading-tight truncate w-full text-center ${
                    activeTab === tab.id
                      ? 'text-purple-600'
                      : 'text-gray-500'
                  }`}>
                    {tab.label}
                  </span>
                  {activeTab === tab.id && (
                    <motion.div
                      className="absolute -bottom-0.5 sm:-bottom-1 w-6 sm:w-8 h-0.5 sm:h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
                      layoutId="activeIndicator"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.nav>
      )}
    </div>
  );
}