import { useState } from 'react';
import { Bell, Plus, Trash2, Edit, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { SETTLEMENTS } from '../../utils/settlements';

interface Announcement {
  id: string;
  type: 'info' | 'warning' | 'urgent';
  service: 'water' | 'electricity' | 'heating' | 'general';
  title: string;
  message: string;
  date: string;
  published: boolean;
  settlement: string; // 'all' для всех населенных пунктов или конкретный населенный пункт
}

export function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'info' as 'info' | 'warning' | 'urgent',
    service: 'general' as 'water' | 'electricity' | 'heating' | 'general',
    title: '',
    message: '',
    settlement: 'all' as 'all' | string
  });

  const typeOptions = [
    { value: 'info', label: 'Информация', color: 'bg-blue-500' },
    { value: 'warning', label: 'Важно', color: 'bg-orange-500' },
    { value: 'urgent', label: 'Срочно', color: 'bg-red-500' }
  ];

  const serviceOptions = [
    { value: 'general', label: 'Общее' },
    { value: 'water', label: 'Водоснабжение' },
    { value: 'electricity', label: 'Электроснабжение' },
    { value: 'heating', label: 'Отопление' }
  ];

  const handleCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({
      type: 'info',
      service: 'general',
      title: '',
      message: '',
      settlement: 'all'
    });
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setIsCreating(false);
    setFormData({
      type: announcement.type,
      service: announcement.service,
      title: announcement.title,
      message: announcement.message,
      settlement: announcement.settlement
    });
  };

  const handleSave = () => {
    if (!formData.title.trim() || !formData.message.trim()) return;

    if (editingId) {
      // Update existing
      setAnnouncements(announcements.map(a => 
        a.id === editingId 
          ? { ...a, ...formData }
          : a
      ));
    } else {
      // Create new
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        ...formData,
        date: new Date().toISOString().split('T')[0],
        published: false
      };
      setAnnouncements([newAnnouncement, ...announcements]);
    }

    setIsCreating(false);
    setEditingId(null);
    setFormData({
      type: 'info',
      service: 'general',
      title: '',
      message: '',
      settlement: 'all'
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить объявление?')) {
      setAnnouncements(announcements.filter(a => a.id !== id));
    }
  };

  const handleTogglePublish = (id: string) => {
    setAnnouncements(announcements.map(a => 
      a.id === id 
        ? { ...a, published: !a.published }
        : a
    ));
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({
      type: 'info',
      service: 'general',
      title: '',
      message: '',
      settlement: 'all'
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Announcements List */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Объявления</CardTitle>
                <CardDescription>
                  Управление информационными объявлениями
                </CardDescription>
              </div>
              <Button
                onClick={handleCreate}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Создать
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {announcements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>Нет объявлений</p>
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.map((announcement) => {
                  const typeOption = typeOptions.find(t => t.value === announcement.type);
                  const serviceOption = serviceOptions.find(s => s.value === announcement.service);

                  return (
                    <div
                      key={announcement.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 ${typeOption?.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Bell className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {typeOption?.label}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {serviceOption?.label}
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                              {announcement.settlement === 'all' ? 'Все НП' : announcement.settlement}
                            </Badge>
                            {announcement.published ? (
                              <Badge className="bg-green-500">Опубликовано</Badge>
                            ) : (
                              <Badge variant="outline">Черновик</Badge>
                            )}
                          </div>
                          <h3 className="text-sm mb-1">{announcement.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{announcement.message}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(announcement.date).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(announcement)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTogglePublish(announcement.id)}
                            className={announcement.published ? 'text-gray-600' : 'text-green-600'}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(announcement.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Form */}
      <div className="lg:sticky lg:top-4 h-fit">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editingId ? 'Редактировать объявление' : isCreating ? 'Новое объявление' : 'Форма объявления'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isCreating && !editingId ? (
              <div className="text-center py-12 text-gray-500">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p>Нажмите "Создать" для добавления нового объявления</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Тип:</Label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'info' | 'warning' | 'urgent' })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    {typeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Служба:</Label>
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value as 'water' | 'electricity' | 'heating' | 'general' })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    {serviceOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Заголовок:</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Введите заголовок объявления"
                  />
                </div>

                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Сообщение:</Label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Введите текст объявления"
                    rows={6}
                    className="resize-none"
                  />
                </div>

                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Населенный пункт:</Label>
                  <select
                    value={formData.settlement}
                    onChange={(e) => setFormData({ ...formData, settlement: e.target.value as 'all' | string })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="all">Все населенные пункты</option>
                    {SETTLEMENTS.map(settlement => (
                      <option key={settlement} value={settlement}>
                        {settlement}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="flex-1"
                  >
                    Отмена
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={!formData.title.trim() || !formData.message.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {editingId ? 'Сохранить' : 'Создать'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}