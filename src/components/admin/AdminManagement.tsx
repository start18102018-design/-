import { useState } from 'react';
import { Shield, UserPlus, Trash2, Key, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';

interface Admin {
  id: string;
  name: string;
  login: string;
  createdDate: string;
  status: 'active' | 'blocked';
  isMainAdmin?: boolean;
}

export function AdminManagement() {
  // Текущий администратор (в реальном приложении получаем из контекста/сессии)
  const currentAdminLogin = 'admin'; // Главный администратор
  
  const [admins, setAdmins] = useState<Admin[]>([
    {
      id: '1',
      name: 'Главный администратор',
      login: 'admin',
      createdDate: '2024-01-01',
      status: 'active',
      isMainAdmin: true
    }
  ]);

  // Проверяем, является ли текущий пользователь главным администратором
  const isMainAdmin = admins.find(a => a.login === currentAdminLogin)?.isMainAdmin || false;

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    login: '',
    password: ''
  });

  const handleAdd = () => {
    if (!formData.name.trim() || !formData.login.trim() || !formData.password.trim()) {
      alert('Заполните все поля');
      return;
    }

    const newAdmin: Admin = {
      id: Date.now().toString(),
      name: formData.name,
      login: formData.login,
      createdDate: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    setAdmins([...admins, newAdmin]);
    setFormData({ name: '', login: '', password: '' });
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (admins.length === 1) {
      alert('Невозможно удалить единственного администратора');
      return;
    }
    if (confirm('Удалить администратора?')) {
      setAdmins(admins.filter(a => a.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setAdmins(admins.map(a => 
      a.id === id 
        ? { ...a, status: a.status === 'active' ? 'blocked' : 'active' }
        : a
    ));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Администраторы
                </CardTitle>
                <CardDescription>
                  Управление учетными записями администраторов
                </CardDescription>
              </div>
              {isMainAdmin && (
                <Button
                  onClick={() => setIsAdding(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Добавить
                </Button>
              )}
              {!isMainAdmin && (
                <Badge variant="outline" className="text-xs text-gray-500">
                  <Shield className="w-3 h-3 mr-1" />
                  Только просмотр
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
                      <p className="text-xs sm:text-sm truncate">{admin.name}</p>
                      {admin.status === 'active' ? (
                        <Badge className="bg-green-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Активен
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500">
                          <XCircle className="w-3 h-3 mr-1" />
                          Заблокирован
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-[10px] sm:text-xs text-gray-500">
                      <span className="truncate">Логин: {admin.login}</span>
                      <span className="hidden sm:inline">
                        Создан: {new Date(admin.createdDate).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 flex-shrink-0">
                    {isMainAdmin ? (
                      <>
                        {!admin.isMainAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(admin.id)}
                            className={`text-xs ${admin.status === 'active' ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                          >
                            <span className="hidden sm:inline">{admin.status === 'active' ? 'Блокировать' : 'Активировать'}</span>
                            <span className="sm:hidden">{admin.status === 'active' ? 'Блок.' : 'Акт.'}</span>
                          </Button>
                        )}
                        {admins.length > 1 && !admin.isMainAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(admin.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                        {admin.isMainAdmin && (
                          <Badge variant="outline" className="text-xs">
                            Главный
                          </Badge>
                        )}
                      </>
                    ) : (
                      <Badge variant="outline" className="text-xs text-gray-400">
                        Нет прав
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:sticky lg:top-4 h-fit">
        {isMainAdmin ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-600" />
                Новый администратор
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isAdding ? (
                <div className="text-center py-12 text-gray-500">
                  <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p>Нажмите "Добавить" для создания нового администратора</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Имя:</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Введите имя"
                    />
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Логин:</Label>
                    <Input
                      value={formData.login}
                      onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                      placeholder="Введите логин"
                    />
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Пароль:</Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Введите пароль"
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Key className="w-4 h-4 text-blue-600 mt-0.5" />
                      <p className="text-xs text-blue-800">
                        Пароль должен быть не менее 8 символов и содержать буквы и цифры
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setIsAdding(false);
                        setFormData({ name: '', login: '', password: '' });
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Отмена
                    </Button>
                    <Button
                      onClick={handleAdd}
                      disabled={!formData.name.trim() || !formData.login.trim() || !formData.password.trim()}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Добавить
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-blue-700">
                <Shield className="w-4 h-4" />
                Информация
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-blue-800 space-y-2">
                <p className="flex items-start gap-2">
                  <Key className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Только главный администратор может добавлять, блокировать и удалять других администраторов.</span>
                </p>
                <p className="flex items-start gap-2">
                  <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Вы можете просматривать список администраторов, но не можете вносить изменения.</span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
