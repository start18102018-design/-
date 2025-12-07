import { useState } from 'react';
import { CreditCard, ArrowLeft, CheckCircle, QrCode, Building2, Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { User } from '../App';

interface PaymentPageProps {
  user: User;
  amount: number;
  period: string;
  onBack: () => void;
}

type PaymentMethod = 'sbp' | 'card' | 'bank';

export function PaymentPage({ user, amount, period, onBack }: PaymentPageProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const paymentMethods = [
    {
      id: 'sbp' as PaymentMethod,
      name: 'Система Быстрых Платежей',
      description: 'Оплата по QR-коду',
      icon: QrCode,
      color: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      id: 'card' as PaymentMethod,
      name: 'Банковская карта',
      description: 'Visa, MasterCard, Мир',
      icon: CreditCard,
      color: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      id: 'bank' as PaymentMethod,
      name: 'Интернет-банк',
      description: 'Сбербанк, ВТБ и другие',
      icon: Building2,
      color: 'bg-green-100',
      iconColor: 'text-green-600'
    }
  ];

  const handlePay = () => {
    if (!selectedMethod) return;

    setIsPaying(true);

    // Симуляция оплаты
    setTimeout(() => {
      setIsPaying(false);
      setIsSuccess(true);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-3 py-4 sm:px-4 sm:py-6">
        <Card className="border-0 shadow-xl">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl mb-2">Оплата успешна!</h2>
            <p className="text-gray-600 mb-6">
              Квитанция за {period} оплачена
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Сумма</span>
                <span className="text-xl">
                  {amount.toLocaleString('ru-RU', {
                    style: 'currency',
                    currency: 'RUB'
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Дата оплаты</span>
                <span>{new Date().toLocaleDateString('ru-RU')}</span>
              </div>
            </div>
            <Button
              onClick={onBack}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Вернуться к квитанциям
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-3 py-4 sm:px-4 sm:py-6 space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-xl">Оплата услуг</h2>
          <p className="text-sm text-gray-500">{period}</p>
        </div>
      </div>

      {/* User Info */}
      <Card className="border-l-4 border-l-blue-600 bg-blue-50">
        <CardContent className="pt-4">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Адрес:</span>
              <span className="text-gray-900">{user.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Лицевой счет:</span>
              <span className="text-gray-900">{user.accountNumber}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amount */}
      <Card className="border-2 border-red-300 bg-gradient-to-br from-red-50 to-red-100">
        <CardContent className="pt-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Сумма к оплате</p>
            <p className="text-3xl text-orange-600">
              {amount.toLocaleString('ru-RU', {
                style: 'currency',
                currency: 'RUB'
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Выберите способ оплаты</CardTitle>
          <CardDescription>
            Все платежи защищены и безопасны
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.id;

            return (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className={`w-12 h-12 ${method.color} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${method.iconColor}`} />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm">{method.name}</div>
                  <div className="text-xs text-gray-500">{method.description}</div>
                </div>
                {isSelected && (
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                )}
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* Payment Details */}
      {selectedMethod === 'sbp' && (
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-4 text-center">
            <Smartphone className="w-12 h-12 text-purple-600 mx-auto mb-3" />
            <p className="text-sm text-gray-700 mb-2">
              После нажатия кнопки "Оплатить" откроется QR-код для оплаты через приложение банка
            </p>
            <Badge variant="outline" className="bg-white">
              Комиссия 0%
            </Badge>
          </CardContent>
        </Card>
      )}

      {selectedMethod === 'card' && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4 text-center">
            <CreditCard className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <p className="text-sm text-gray-700 mb-2">
              Вы будете перенаправлены на защищенную страницу для ввода данных карты
            </p>
            <Badge variant="outline" className="bg-white">
              Комиссия 0%
            </Badge>
          </CardContent>
        </Card>
      )}

      {selectedMethod === 'bank' && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4 text-center">
            <Building2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <p className="text-sm text-gray-700 mb-2">
              Выберите ваш банк и войдите в интернет-банк для завершения оплаты
            </p>
            <Badge variant="outline" className="bg-white">
              Комиссия 0%
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Pay Button */}
      <Button
        onClick={handlePay}
        disabled={!selectedMethod || isPaying}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
      >
        {isPaying ? 'Обработка платежа...' : 'Оплатить'}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Нажимая кнопку "Оплатить", вы соглашаетесь с условиями оплаты
      </p>
    </div>
  );
}