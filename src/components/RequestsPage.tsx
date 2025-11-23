import { useState } from 'react';
import { Wrench, Plus, Send, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import type { User } from '../App';

interface Request {
  id: string;
  userId: string;
  userAddress: string;
  userSettlement: string;
  type: string;
  description: string;
  createdDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
}

interface RequestsPageProps {
  user: User;
}

const REQUEST_TYPES = [
  'Водоснабжение',
  'Электроснабжение',
  'Отопление',
  'Канализация',
  'Прочее'
];

const statusConfig = {
  pending: { label: 'На рассмотрении', color: 'bg-yellow-500', icon: Clock },
  in_progress: { label: 'В работе', color: 'bg-blue-500', icon: Clock },
  completed: { label: 'Выполнено', color: 'bg-green-500', icon: CheckCircle },
  rejected: { label: 'Отклонено', color: 'bg-red-500', icon: XCircle }
};

export function RequestsPage({ user }: RequestsPageProps) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Водоснабжение',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      alert('Пожалуйста, опишите проблему');
      return;
    }

    const newRequest: Request = {
      id: Date.now().toString(),
      userId: user.phone,
      userAddress: user.address,
      userSettlement: user.settlement,
      type: formData.type,
      description: formData.description,
      createdDate: new Date().toISOString(),
      status: 'pending'
    };

    setRequests([newRequest, ...requests]);
    setFormData({ type: 'Водоснабжение', description: '' });
    setIsCreating(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wrench className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl">Мои заявки на ремонт</h2>
        </div>
        {!isCreating && (
          <Button 
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Создать заявку
          </Button>
        )}
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card className="border-2 border-blue-300">
          <CardHeader>
            <CardTitle>Новая заявка на ремонт</CardTitle>
            <CardDescription>
              Опишите проблему, и наши специалисты свяжутся с вами
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Тип проблемы *</Label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  {REQUEST_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Адрес</Label>
                <Input value={user.address} disabled className="bg-gray-50" />
              </div>

              <div className="space-y-2">
                <Label>Описание проблемы *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Опишите подробно, что случилось и какая помощь требуется..."
                  rows={5}
                  required
                  className="resize-none"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setFormData({ type: 'Водоснабжение', description: '' });
                  }}
                  className="flex-1"
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Отправить заявку
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Requests List */}
      <div className="space-y-3">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-gray-500">
                <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="mb-2">У вас пока нет заявок на ремонт</p>
                <p className="text-sm">Нажмите кнопку "Создать заявку" для подачи заявки</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => {
            const config = statusConfig[request.status];
            const StatusIcon = config.icon;

            return (
              <Card key={request.id} className="border-l-4 border-blue-600">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Wrench className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{request.type}</Badge>
                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${config.color} text-white text-xs`}>
                            <StatusIcon className="w-3 h-3" />
                            <span>{config.label}</span>
                          </div>
                        </div>
                        <CardTitle className="text-sm">Заявка #{request.id.slice(-6)}</CardTitle>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Адрес:</p>
                    <p className="text-sm">{request.userAddress}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Описание проблемы:</p>
                    <p className="text-sm text-gray-700">{request.description}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Создано: {new Date(request.createdDate).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
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
