import { useState } from 'react';
import { Home, Plus, Search, Trash2, Edit, Gauge, MapPin, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { SETTLEMENTS, STREETS_BY_SETTLEMENT } from '../../utils/settlements';

interface Meter {
  id: string;
  type: 'cold_water' | 'hot_water' | 'heating' | 'electricity' | 'gas';
  serialNumber: string;
  installDate: string;
  lastCheckDate: string;
  nextCheckDate: string;
}

interface Account {
  id: string;
  accountNumber: string;
  settlement: string;
  street: string;
  houseNumber: string;
  apartment: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  meters: Meter[];
  createdDate: string;
  active: boolean;
}

const METER_TYPES = {
  cold_water: 'Холодная вода',
  hot_water: 'Горячая вода',
  heating: 'Отопление',
  electricity: 'Электричество',
  gas: 'Газ'
};

export function AdminAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [isAddingMeter, setIsAddingMeter] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [settlementFilter, setSettlementFilter] = useState('');
  const [streetSuggestions, setStreetSuggestions] = useState<string[]>([]);
  const [showStreetSuggestions, setShowStreetSuggestions] = useState(false);

  const [newAccount, setNewAccount] = useState({
    accountNumber: '',
    settlement: '',
    street: '',
    houseNumber: '',
    apartment: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: ''
  });

  const [newMeter, setNewMeter] = useState({
    type: 'cold_water' as keyof typeof METER_TYPES,
    serialNumber: '',
    installDate: new Date().toISOString().split('T')[0],
    lastCheckDate: new Date().toISOString().split('T')[0],
    nextCheckDate: ''
  });

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = 
      account.accountNumber.includes(searchTerm) ||
      account.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.houseNumber.includes(searchTerm);
    
    const matchesSettlement = !settlementFilter || account.settlement === settlementFilter;
    
    return matchesSearch && matchesSettlement;
  });

  const handleAddAccount = () => {
    if (!newAccount.accountNumber || !newAccount.settlement || !newAccount.street || 
        !newAccount.houseNumber || !newAccount.apartment || !newAccount.ownerName) {
      alert('Заполните все обязательные поля');
      return;
    }

    const account: Account = {
      id: Date.now().toString(),
      ...newAccount,
      meters: [],
      createdDate: new Date().toISOString(),
      active: true
    };

    setAccounts([...accounts, account]);
    setNewAccount({
      accountNumber: '',
      settlement: '',
      street: '',
      houseNumber: '',
      apartment: '',
      ownerName: '',
      ownerPhone: '',
      ownerEmail: ''
    });
    setIsAddingAccount(false);
  };

  const handleAddMeter = () => {
    if (!selectedAccount || !newMeter.serialNumber) {
      alert('Заполните все обязательные поля');
      return;
    }

    const meter: Meter = {
      id: Date.now().toString(),
      ...newMeter
    };

    setAccounts(accounts.map(acc => 
      acc.id === selectedAccount.id 
        ? { ...acc, meters: [...acc.meters, meter] }
        : acc
    ));

    setSelectedAccount({
      ...selectedAccount,
      meters: [...selectedAccount.meters, meter]
    });

    setNewMeter({
      type: 'cold_water',
      serialNumber: '',
      installDate: new Date().toISOString().split('T')[0],
      lastCheckDate: new Date().toISOString().split('T')[0],
      nextCheckDate: ''
    });
    setIsAddingMeter(false);
  };

  const handleDeleteMeter = (meterId: string) => {
    if (!selectedAccount) return;
    
    if (confirm('Удалить прибор учета?')) {
      setAccounts(accounts.map(acc => 
        acc.id === selectedAccount.id 
          ? { ...acc, meters: acc.meters.filter(m => m.id !== meterId) }
          : acc
      ));

      setSelectedAccount({
        ...selectedAccount,
        meters: selectedAccount.meters.filter(m => m.id !== meterId)
      });
    }
  };

  const handleDeactivateAccount = (accountId: string) => {
    if (confirm('Деактивировать лицевой счет?')) {
      setAccounts(accounts.map(acc => 
        acc.id === accountId ? { ...acc, active: false } : acc
      ));
      if (selectedAccount?.id === accountId) {
        setSelectedAccount({ ...selectedAccount, active: false });
      }
    }
  };

  const availableStreets = newAccount.settlement ? STREETS_BY_SETTLEMENT[newAccount.settlement] || [] : [];

  const handleStreetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewAccount({ ...newAccount, street: value });
    if (value) {
      const suggestions = availableStreets.filter(street => street.toLowerCase().includes(value.toLowerCase()));
      setStreetSuggestions(suggestions);
      setShowStreetSuggestions(true);
    } else {
      setStreetSuggestions([]);
      setShowStreetSuggestions(false);
    }
  };

  const handleStreetSelect = (street: string) => {
    setNewAccount({ ...newAccount, street });
    setStreetSuggestions([]);
    setShowStreetSuggestions(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Stats */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всего лицевых счетов</p>
                <p className="text-2xl">{accounts.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-blue-600" />
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
                  {accounts.filter(a => a.active).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всего приборов</p>
                <p className="text-2xl text-purple-600">
                  {accounts.reduce((sum, a) => sum + a.meters.length, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Gauge className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Населенных пунктов</p>
                <p className="text-2xl text-orange-600">
                  {new Set(accounts.map(a => a.settlement)).size}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accounts List */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle>Лицевые счета</CardTitle>
                <CardDescription>Управление лицевыми счетами и приборами учета</CardDescription>
              </div>
              <Button onClick={() => setIsAddingAccount(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Добавить счет
              </Button>
            </div>
            <div className="flex gap-2 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Поиск по счету, адресу, владельцу..."
                  className="pl-10"
                />
              </div>
              <select
                value={settlementFilter}
                onChange={(e) => setSettlementFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Все населенные пункты</option>
                {SETTLEMENTS.map(settlement => (
                  <option key={settlement} value={settlement}>{settlement}</option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredAccounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => setSelectedAccount(account)}
                  className={`w-full text-left p-4 border rounded-lg transition-all ${
                    selectedAccount?.id === account.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">ЛС: {account.accountNumber}</span>
                        {account.active ? (
                          <Badge className="bg-green-500 text-xs">Активен</Badge>
                        ) : (
                          <Badge className="bg-gray-500 text-xs">Неактивен</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{account.ownerName}</p>
                      <p className="text-xs text-gray-500">
                        {account.settlement}, {account.street}, д. {account.houseNumber}, кв. {account.apartment}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          <Gauge className="w-3 h-3 mr-1" />
                          Приборов: {account.meters.length}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </button>
              ))}

              {filteredAccounts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>Лицевые счета не найдены</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Details / Add Form */}
      <div className="lg:sticky lg:top-4 h-fit">
        {isAddingAccount ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Добавить лицевой счет</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Номер лицевого счета *</Label>
                <Input
                  value={newAccount.accountNumber}
                  onChange={(e) => setNewAccount({ ...newAccount, accountNumber: e.target.value })}
                  placeholder="123456789"
                />
              </div>

              <div className="space-y-2">
                <Label>Населенный пункт *</Label>
                <select
                  value={newAccount.settlement}
                  onChange={(e) => setNewAccount({ ...newAccount, settlement: e.target.value, street: '' })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Выберите населенный пункт</option>
                  {SETTLEMENTS.map(settlement => (
                    <option key={settlement} value={settlement}>{settlement}</option>
                  ))}
                </select>
              </div>

              {newAccount.settlement && (
                <div className="space-y-2">
                  <Label>Улица *</Label>
                  <div className="relative">
                    <Input
                      value={newAccount.street}
                      onChange={handleStreetChange}
                      placeholder="Введите улицу"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    {showStreetSuggestions && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-b-md shadow-md">
                        {streetSuggestions.map(street => (
                          <div
                            key={street}
                            className="p-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => handleStreetSelect(street)}
                          >
                            {street}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>Дом *</Label>
                  <Input
                    value={newAccount.houseNumber}
                    onChange={(e) => setNewAccount({ ...newAccount, houseNumber: e.target.value })}
                    placeholder="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Квартира *</Label>
                  <Input
                    value={newAccount.apartment}
                    onChange={(e) => setNewAccount({ ...newAccount, apartment: e.target.value })}
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>ФИО собственника *</Label>
                <Input
                  value={newAccount.ownerName}
                  onChange={(e) => setNewAccount({ ...newAccount, ownerName: e.target.value })}
                  placeholder="Иванов Иван Иванович"
                />
              </div>

              <div className="space-y-2">
                <Label>Телефон собственника</Label>
                <Input
                  value={newAccount.ownerPhone}
                  onChange={(e) => setNewAccount({ ...newAccount, ownerPhone: e.target.value })}
                  placeholder="+7 (___) ___-__-__"
                />
              </div>

              <div className="space-y-2">
                <Label>Email собственника</Label>
                <Input
                  type="email"
                  value={newAccount.ownerEmail}
                  onChange={(e) => setNewAccount({ ...newAccount, ownerEmail: e.target.value })}
                  placeholder="example@mail.ru"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddAccount} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Сохранить
                </Button>
                <Button onClick={() => setIsAddingAccount(false)} variant="outline" className="flex-1">
                  Отмена
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : selectedAccount ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Детали лицевого счета</CardTitle>
                {selectedAccount.active && (
                  <Button
                    onClick={() => handleDeactivateAccount(selectedAccount.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                  >
                    Деактивировать
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Account Info */}
              <div className="pb-4 border-b border-gray-200">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Home className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-lg">ЛС: {selectedAccount.accountNumber}</p>
                  {selectedAccount.active ? (
                    <Badge className="bg-green-500 mt-2">Активен</Badge>
                  ) : (
                    <Badge className="bg-gray-500 mt-2">Неактивен</Badge>
                  )}
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Собственник</p>
                      <p>{selectedAccount.ownerName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Адрес</p>
                      <p>{selectedAccount.settlement}</p>
                      <p>{selectedAccount.street}, д. {selectedAccount.houseNumber}, кв. {selectedAccount.apartment}</p>
                    </div>
                  </div>

                  {selectedAccount.ownerPhone && (
                    <div className="flex items-start gap-2">
                      <p className="text-xs text-gray-500">Телефон:</p>
                      <p>{selectedAccount.ownerPhone}</p>
                    </div>
                  )}

                  {selectedAccount.ownerEmail && (
                    <div className="flex items-start gap-2">
                      <p className="text-xs text-gray-500">Email:</p>
                      <p>{selectedAccount.ownerEmail}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Meters Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm">Приборы учета ({selectedAccount.meters.length})</h4>
                  {!isAddingMeter && (
                    <Button
                      onClick={() => setIsAddingMeter(true)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Добавить
                    </Button>
                  )}
                </div>

                {isAddingMeter && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Тип прибора *</Label>
                      <select
                        value={newMeter.type}
                        onChange={(e) => setNewMeter({ ...newMeter, type: e.target.value as keyof typeof METER_TYPES })}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      >
                        {Object.entries(METER_TYPES).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Заводской номер *</Label>
                      <Input
                        value={newMeter.serialNumber}
                        onChange={(e) => setNewMeter({ ...newMeter, serialNumber: e.target.value })}
                        placeholder="12345678"
                        className="text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Дата установки</Label>
                      <Input
                        type="date"
                        value={newMeter.installDate}
                        onChange={(e) => setNewMeter({ ...newMeter, installDate: e.target.value })}
                        className="text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Дата последней поверки</Label>
                      <Input
                        type="date"
                        value={newMeter.lastCheckDate}
                        onChange={(e) => setNewMeter({ ...newMeter, lastCheckDate: e.target.value })}
                        className="text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Дата следующей поверки</Label>
                      <Input
                        type="date"
                        value={newMeter.nextCheckDate}
                        onChange={(e) => setNewMeter({ ...newMeter, nextCheckDate: e.target.value })}
                        className="text-sm"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleAddMeter} size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                        Добавить
                      </Button>
                      <Button onClick={() => setIsAddingMeter(false)} size="sm" variant="outline" className="flex-1">
                        Отмена
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {selectedAccount.meters.map((meter) => (
                    <div key={meter.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Gauge className="w-4 h-4 text-blue-600" />
                            <span className="text-sm">{METER_TYPES[meter.type]}</span>
                          </div>
                          <p className="text-xs text-gray-600">№ {meter.serialNumber}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Установлен: {new Date(meter.installDate).toLocaleDateString('ru-RU')}
                          </p>
                          {meter.nextCheckDate && (
                            <p className="text-xs text-gray-500">
                              След. поверка: {new Date(meter.nextCheckDate).toLocaleDateString('ru-RU')}
                            </p>
                          )}
                        </div>
                        <Button
                          onClick={() => handleDeleteMeter(meter.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {selectedAccount.meters.length === 0 && !isAddingMeter && (
                    <div className="text-center py-6 text-gray-500">
                      <Gauge className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm">Приборы учета не добавлены</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Детали лицевого счета</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p>Выберите лицевой счет из списка</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}