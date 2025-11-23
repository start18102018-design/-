import { useState } from 'react';
import { Home, MessageCircle, User as UserIcon, Gauge, FileText, Wrench, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-400/20 rounded-full blur-3xl float-animation" />
        <div className="absolute top-40 right-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl float-animation" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 left-1/4 w-36 h-36 bg-pink-400/20 rounded-full blur-3xl float-animation" style={{ animationDelay: '2s' }} />
      </div>

      {/* Glassmorphic Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass relative z-10 backdrop-blur-2xl shadow-2xl border-b border-white/20"
      >
        <div className="max-w-2xl mx-auto p-6">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1 
                className="text-2xl font-bold gradient-text flex items-center gap-2"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <Sparkles className="w-6 h-6 text-yellow-400" />
                Коммунальные сервисы
              </motion.h1>
              <motion.p 
                className="text-sm text-gray-600 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Привет, <span className="font-semibold text-purple-600">{user.name}</span>! 👋
              </motion.p>
            </div>
            <motion.div
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-2xl font-bold">{user.name.charAt(0)}</span>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Content with page transitions */}
      <main className="flex-1 overflow-auto pb-24 relative z-10">
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

      {/* Floating Glassmorphic Bottom Navigation */}
      {activeTab !== 'payment' && (
        <motion.nav 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-4 left-4 right-4 z-50"
        >
          <div className="max-w-2xl mx-auto glass rounded-3xl shadow-2xl p-2">
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
                  className="relative flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-2xl transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <tab.icon 
                    className={`w-6 h-6 relative z-10 transition-colors ${
                      activeTab === tab.id
                        ? 'text-purple-600'
                        : 'text-gray-500'
                    }`} 
                  />
                  <span className={`text-xs relative z-10 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-purple-600'
                      : 'text-gray-500'
                  }`}>
                    {tab.label}
                  </span>
                  {activeTab === tab.id && (
                    <motion.div
                      className="absolute -bottom-1 w-8 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
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