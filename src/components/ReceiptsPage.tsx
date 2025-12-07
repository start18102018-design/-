import { useState } from 'react';
import { FileText, Download, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { User } from '../App';

interface Receipt {
  id: string;
  period: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: 'paid' | 'unpaid' | 'overdue';
  services: {
    name: string;
    amount: number;
  }[];
}

interface ReceiptsPageProps {
  user: User;
  onNavigateToPayment?: (amount: number, period: string) => void;
}

const mockReceipts: Receipt[] = [
  {
    id: '1',
    period: 'Ноябрь 2025',
    amount: 5320.75,
    issueDate: '2025-11-01',
    dueDate: '2025-11-25',
    status: 'unpaid',
    services: [
      { name: 'Холодная вода', amount: 890.50 },
      { name: 'Горячая вода', amount: 1240.30 },
      { name: 'Отопление', amount: 2850.00 },
      { name: 'Водоотведение', amount: 339.95 }
    ]
  },
  {
    id: '2',
    period: 'Октябрь 2025',
    amount: 4250.50,
    issueDate: '2025-10-01',
    dueDate: '2025-10-25',
    status: 'overdue',
    services: [
      { name: 'Холодная вода', amount: 825.30 },
      { name: 'Горячая вода', amount: 1180.20 },
      { name: 'Отопление', amount: 1920.00 },
      { name: 'Водоотведение', amount: 325.00 }
    ]
  },
  {
    id: '3',
    period: 'Сентябрь 2025',
    amount: 3980.00,
    issueDate: '2025-09-01',
    dueDate: '2025-09-25',
    status: 'paid',
    services: [
      { name: 'Холодная вода', amount: 780.00 },
      { name: 'Горячая вода', amount: 1150.00 },
      { name: 'Отопление', amount: 1720.00 },
      { name: 'Водоотведение', amount: 330.00 }
    ]
  },
  {
    id: '4',
    period: 'Август 2025',
    amount: 3650.25,
    issueDate: '2025-08-01',
    dueDate: '2025-08-25',
    status: 'paid',
    services: [
      { name: 'Холодная вода', amount: 795.50 },
      { name: 'Горячая вода', amount: 1120.75 },
      { name: 'Отопление', amount: 1420.00 },
      { name: 'Водоотведение', amount: 314.00 }
    ]
  }
];

const statusConfig = {
  paid: {
    label: 'Оплачено',
    color: 'bg-green-500',
    icon: CheckCircle
  },
  unpaid: {
    label: 'Не оплачено',
    color: 'bg-yellow-500',
    icon: AlertCircle
  },
  overdue: {
    label: 'Просрочено',
    color: 'bg-red-500',
    icon: AlertCircle
  }
};

export function ReceiptsPage({ user, onNavigateToPayment }: ReceiptsPageProps) {
  const [receipts] = useState<Receipt[]>(mockReceipts);
  const [expandedReceipt, setExpandedReceipt] = useState<string | null>(null);

  const handleDownload = (receipt: Receipt) => {
    alert(`Скачивание квитанции за ${receipt.period}`);
  };

  const handlePay = (receipt: Receipt) => {
    if (onNavigateToPayment) {
      onNavigateToPayment(receipt.amount, receipt.period);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedReceipt(expandedReceipt === id ? null : id);
  };

  return (
    <div className="max-w-2xl mx-auto px-3 py-4 sm:px-4 sm:py-6 space-y-3 sm:space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl">Квитанции</h2>
      </div>

      {/* Address Card */}
      <Card className="border-l-4 border-l-blue-600 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Адрес:</span>
            <span className="text-gray-900">{user.address}</span>
          </div>
        </CardContent>
      </Card>

      {/* Receipts List */}
      <div className="space-y-3">
        {receipts.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Квитанции отсутствуют</p>
            </CardContent>
          </Card>
        ) : (
          receipts.map((receipt) => {
            const config = statusConfig[receipt.status];
            const StatusIcon = config.icon;
            const isExpanded = expandedReceipt === receipt.id;

            return (
              <Card key={receipt.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{receipt.period}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-500">
                            До {new Date(receipt.dueDate).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'long'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge className={config.color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {config.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Amount */}
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-gray-600">Сумма к оплате</span>
                    <span className="text-xl text-gray-900">
                      {receipt.amount.toLocaleString('ru-RU', {
                        style: 'currency',
                        currency: 'RUB'
                      })}
                    </span>
                  </div>

                  {/* Services Breakdown */}
                  {isExpanded && (
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-600">Начисления по услугам:</p>
                      {receipt.services.map((service, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{service.name}</span>
                          <span className="text-gray-900">
                            {service.amount.toLocaleString('ru-RU', {
                              style: 'currency',
                              currency: 'RUB'
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExpand(receipt.id)}
                      className="flex-1"
                    >
                      {isExpanded ? 'Свернуть' : 'Подробнее'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(receipt)}
                      className="flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      Скачать
                    </Button>
                    {receipt.status !== 'paid' && (
                      <Button
                        size="sm"
                        onClick={() => handlePay(receipt)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Оплатить
                      </Button>
                    )}
                  </div>

                  {/* Issue Date */}
                  <p className="text-xs text-gray-400 text-center">
                    Выставлено: {new Date(receipt.issueDate).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}