import { useState } from 'react';
import { Users, Search, Eye, Mail, Phone, MapPin, CreditCard, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';

interface UserData {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  settlement: string;
  street: string;
  houseNumber: string;
  apartment: string;
  accountNumber: string;
  debt: number;
  lastPayment: string;
  status: 'active' | 'blocked';
  registeredDate: string;
}

export function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [settlementFilter, setSettlementFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.accountNumber.includes(searchTerm) ||
      user.phone.includes(searchTerm);
    
    const matchesSettlement = !settlementFilter || user.settlement === settlementFilter;
    
    return matchesSearch && matchesSettlement;
  });

  const handleToggleStatus = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, status: u.status === 'active' ? 'blocked' : 'active' }
        : u
    ));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Stats Cards */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всего пользователей</p>
                <p className="text-2xl">{users.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Активные</p>
                <p className="text-2xl text-green-600">
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">С задолженностью</p>
                <p className="text-2xl text-orange-600">
                  {users.filter(u => u.debt > 0).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Общая задолженность</p>
                <p className="text-2xl text-red-600">
                  {users.reduce((sum, u) => sum + u.debt, 0).toLocaleString('ru-RU', {
                    maximumFractionDigits: 0
                  })} ₽
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <CardTitle>Пользователи</CardTitle>
                <CardDescription>
                  Список зарегистрированных пользователей
                </CardDescription>
              </div>
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Поиск..."
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full text-left p-4 border rounded-lg transition-all ${
                    selectedUser?.id === user.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm truncate">{user.name}</p>
                          {user.status === 'active' ? (
                            <Badge className="bg-green-500 text-xs">Активен</Badge>
                          ) : (
                            <Badge className="bg-red-500 text-xs">Заблокирован</Badge>
                          )}
                          {user.debt > 0 && (
                            <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">
                              Долг: {user.debt.toLocaleString('ru-RU')} ₽
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{user.address}</p>
                      </div>
                    </div>
                    <Eye className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                </button>
              ))}

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>Пользователи не найдены</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Details */}
      <div className="lg:sticky lg:top-4 h-fit">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {selectedUser ? 'Информация о пользователе' : 'Детали пользователя'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedUser ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p>Выберите пользователя из списка</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Avatar and Name */}
                <div className="text-center pb-4 border-b border-gray-200">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl text-white">
                      {selectedUser.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-lg mb-1">{selectedUser.name}</h3>
                  {selectedUser.status === 'active' ? (
                    <Badge className="bg-green-500">Активен</Badge>
                  ) : (
                    <Badge className="bg-red-500">Заблокирован</Badge>
                  )}
                </div>

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Телефон</p>
                      <p className="text-sm">{selectedUser.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm">{selectedUser.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Адрес</p>
                      <p className="text-sm">{selectedUser.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CreditCard className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Лицевой счет</p>
                      <p className="text-sm">{selectedUser.accountNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Financial Info */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Задолженность</span>
                    <span className={`text-lg ${selectedUser.debt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedUser.debt.toLocaleString('ru-RU', {
                        style: 'currency',
                        currency: 'RUB'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Последний платеж</span>
                    <span className="text-sm">
                      {new Date(selectedUser.lastPayment).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Дата регистрации</span>
                    <span className="text-sm">
                      {new Date(selectedUser.registeredDate).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <Button
                    onClick={() => handleToggleStatus(selectedUser.id)}
                    variant="outline"
                    className={`w-full ${
                      selectedUser.status === 'active' 
                        ? 'text-red-600 hover:bg-red-50' 
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                  >
                    {selectedUser.status === 'active' ? 'Заблокировать' : 'Разблокировать'}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                  >
                    Отправить уведомление
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