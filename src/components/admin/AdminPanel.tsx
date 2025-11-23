import { useState } from 'react';
import { Shield, Upload, MessageCircle, Bell, Users, BarChart, LogOut, Settings, CreditCard, Home, Wrench } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8" />
            <div>
              <h1 className="text-xl">Панель администратора</h1>
              <p className="text-sm opacity-90">Управление системой</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Выход
          </Button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'stats'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart className="w-5 h-5" />
            <span>Статистика</span>
          </button>

          <button
            onClick={() => setActiveTab('receipts')}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'receipts'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Upload className="w-5 h-5" />
            <span>Загрузка квитанций</span>
          </button>

          <button
            onClick={() => setActiveTab('qa')}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'qa'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <MessageCircle className="w-5 h-5" />
            <span>Вопросы-Ответы</span>
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'announcements'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span>Объявления</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Пользователи</span>
          </button>

          <button
            onClick={() => setActiveTab('admins')}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'admins'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span>Администраторы</span>
          </button>

          <button
            onClick={() => setActiveTab('payment')}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'payment'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span>Платежи</span>
          </button>

          <button
            onClick={() => setActiveTab('accounts')}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'accounts'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Счета</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'requests'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Wrench className="w-5 h-5" />
            <span>Запросы</span>
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-auto p-4">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'stats' && <AdminStats />}
          {activeTab === 'receipts' && <AdminReceiptsUpload />}
          {activeTab === 'qa' && <AdminQAManagement />}
          {activeTab === 'announcements' && <AdminAnnouncements />}
          {activeTab === 'users' && <AdminUsers />}
          {activeTab === 'admins' && <AdminManagement />}
          {activeTab === 'payment' && <PaymentSettings />}
          {activeTab === 'accounts' && <AdminAccounts />}
          {activeTab === 'requests' && <AdminRequests />}
        </div>
      </main>
    </div>
  );
}