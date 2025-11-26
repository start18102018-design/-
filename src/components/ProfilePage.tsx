import { useState } from 'react';
import { User, Phone, MapPin, LogOut, CreditCard, FileText, Settings, Mail, Fingerprint, Lock, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Input } from './ui/input';
import type { User as UserType } from '../App';
import { hashPassword, verifyPassword } from '../utils/security';

interface ProfilePageProps {
  user: UserType;
  onLogout: () => void;
  onNavigateToReceipts?: () => void;
  onNavigateToPayment?: () => void;
  onUpdateUser?: (user: UserType) => void;
}

export function ProfilePage({ user, onLogout, onNavigateToReceipts, onNavigateToPayment, onUpdateUser }: ProfilePageProps) {
  const [settings, setSettings] = useState({
    noPaperReceipt: false,
    hideRetiredMeters: true,
    fingerprintLogin: false,
    pinCodeLogin: true
  });

  const [isChangingPin, setIsChangingPin] = useState(false);
  const [pinData, setPinData] = useState({
    currentPin: '',
    newPin: '',
    confirmPin: ''
  });
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  const handleChangePinCode = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verify current PIN
    const isCurrentPinValid = await verifyPassword(pinData.currentPin, user.pinCode);
    if (!isCurrentPinValid) {
      alert('Неверный текущий пин-код');
      return;
    }

    if (pinData.newPin.length !== 4 && pinData.newPin.length !== 6) {
      alert('Новый пин-код должен содержать 4 или 6 цифр');
      return;
    }

    if (!/^\d+$/.test(pinData.newPin)) {
      alert('Пин-код должен содержать только цифры');
      return;
    }

    if (pinData.newPin !== pinData.confirmPin) {
      alert('Новый пин-код и подтверждение не совпадают');
      return;
    }

    // Hash the new PIN before storing
    const hashedNewPin = await hashPassword(pinData.newPin);

    // Update user with new hashed pin code
    const updatedUser = { ...user, pinCode: hashedNewPin };
    
    // Update in localStorage
    const storedUsers = localStorage.getItem('registeredUsers');
    if (storedUsers) {
      const users: UserType[] = JSON.parse(storedUsers);
      const updatedUsers = users.map(u => u.phone === user.phone ? updatedUser : u);
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    }

    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    }

    alert('Пин-код успешно изменен');
    setIsChangingPin(false);
    setPinData({ currentPin: '', newPin: '', confirmPin: '' });
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {/* Profile Header */}
      <Card className="bg-blue-600 text-white border-0">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <User className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl mb-2">{user.name}</h2>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm opacity-90">
                  <Phone className="w-4 h-4" />
                  <span>{user.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm opacity-90">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm opacity-90">
                  <MapPin className="w-4 h-4" />
                  <span>{user.settlement}</span>
                </div>
                <div className="flex items-center gap-2 text-sm opacity-90">
                  <MapPin className="w-4 h-4" />
                  <span>{user.street}, д. {user.houseNumber}, кв. {user.apartment}</span>
                </div>
                <div className="flex items-center gap-2 text-sm opacity-90">
                  <CreditCard className="w-4 h-4" />
                  <span>Лицевой счет: {user.accountNumber}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <button
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
            onClick={onNavigateToPayment}
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm">Оплатить услуги</div>
              <div className="text-xs text-gray-500">Быстрая оплата через СБП</div>
            </div>
          </button>

          <button
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
            onClick={onNavigateToReceipts}
          >
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm">Мои счета</div>
              <div className="text-xs text-gray-500">История начислений</div>
            </div>
          </button>

          <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm">Настройки</div>
              <div className="text-xs text-gray-500">Уведомления и профиль</div>
            </div>
          </button>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Настройки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-500" />
              <Label htmlFor="noPaperReceipt" className="cursor-pointer">
                <div className="text-sm">Отказаться от бумажной квитанции</div>
                <div className="text-xs text-gray-500">Получать только электронные квитанции</div>
              </Label>
            </div>
            <Checkbox
              id="noPaperReceipt"
              checked={settings.noPaperReceipt}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, noPaperReceipt: checked as boolean })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-gray-500" />
              <Label htmlFor="hideRetiredMeters" className="cursor-pointer">
                <div className="text-sm">Не показывать выбывшие приборы</div>
                <div className="text-xs text-gray-500">Скрыть неактивные счетчики</div>
              </Label>
            </div>
            <Checkbox
              id="hideRetiredMeters"
              checked={settings.hideRetiredMeters}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, hideRetiredMeters: checked as boolean })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Fingerprint className="w-5 h-5 text-gray-500" />
              <Label htmlFor="fingerprintLogin" className="cursor-pointer">
                <div className="text-sm">Вход по отпечатку пальца</div>
                <div className="text-xs text-gray-500">Биометрическая аутентификация</div>
              </Label>
            </div>
            <Checkbox
              id="fingerprintLogin"
              checked={settings.fingerprintLogin}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, fingerprintLogin: checked as boolean })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-gray-500" />
              <Label htmlFor="pinCodeLogin" className="cursor-pointer">
                <div className="text-sm">Вход по пин-коду</div>
                <div className="text-xs text-gray-500">4-значный код для быстрого входа</div>
              </Label>
            </div>
            <Checkbox
              id="pinCodeLogin"
              checked={settings.pinCodeLogin}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, pinCodeLogin: checked as boolean })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Change Pin Code */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Безопасность</CardTitle>
        </CardHeader>
        <CardContent>
          {!isChangingPin ? (
            <Button
              onClick={() => setIsChangingPin(true)}
              variant="outline"
              className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <Lock className="w-4 h-4 mr-2" />
              Изменить пин-код
            </Button>
          ) : (
            <form onSubmit={handleChangePinCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPin">Текущий пин-код</Label>
                <div className="relative">
                  <Input
                    id="currentPin"
                    type={showCurrentPin ? 'text' : 'password'}
                    value={pinData.currentPin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setPinData({ ...pinData, currentPin: value });
                    }}
                    maxLength={6}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPin(!showCurrentPin)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCurrentPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPin">Новый пин-код (4 или 6 цифр)</Label>
                <div className="relative">
                  <Input
                    id="newPin"
                    type={showNewPin ? 'text' : 'password'}
                    value={pinData.newPin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setPinData({ ...pinData, newPin: value });
                    }}
                    maxLength={6}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPin(!showNewPin)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPin">Подтвердите новый пин-код</Label>
                <div className="relative">
                  <Input
                    id="confirmPin"
                    type={showConfirmPin ? 'text' : 'password'}
                    value={pinData.confirmPin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setPinData({ ...pinData, confirmPin: value });
                    }}
                    maxLength={6}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPin(!showConfirmPin)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {pinData.newPin && pinData.confirmPin && (
                <div className={`p-3 rounded-lg border ${
                  pinData.newPin === pinData.confirmPin 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <p className={`text-sm ${
                    pinData.newPin === pinData.confirmPin 
                      ? 'text-green-700' 
                      : 'text-red-700'
                  }`}>
                    {pinData.newPin === pinData.confirmPin 
                      ? '✓ Пин-коды совпадают' 
                      : '✗ Пин-коды не совпадают'}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsChangingPin(false);
                    setPinData({ currentPin: '', newPin: '', confirmPin: '' });
                  }}
                  className="flex-1"
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!pinData.currentPin || !pinData.newPin || !pinData.confirmPin || pinData.newPin !== pinData.confirmPin}
                >
                  Сохранить
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Статистика</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl text-blue-600 mb-1">12</div>
              <div className="text-xs text-gray-600">Получено объявлений</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl text-orange-600 mb-1">3</div>
              <div className="text-xs text-gray-600">Заданных вопросов</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logout Button */}
      <Button
        onClick={onLogout}
        variant="outline"
        className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Выйти из аккаунта
      </Button>
    </div>
  );
}