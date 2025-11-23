import { useState } from 'react';
import { Building2, CreditCard, Save, Edit, Plus, Trash2, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';

interface PaymentAccount {
  id: string;
  settlementName: string;
  accountNumber: string;
  bankName: string;
  bik: string;
  correspondentAccount: string;
  inn: string;
  kpp: string;
  recipientName: string;
}

interface SupplierDetails {
  name: string;
  fullName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

export function PaymentSettings() {
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  
  const [supplierDetails, setSupplierDetails] = useState<SupplierDetails>({
    name: 'ООО "ТеплоСервис"',
    fullName: 'Общество с ограниченной ответственностью "ТеплоСервис"',
    address: 'г. Москва, ул. Примерная, д. 1',
    phone: '+7 (495) 123-45-67',
    email: 'info@teploservice.ru',
    website: 'www.teploservice.ru'
  });

  const [isEditingSupplier, setIsEditingSupplier] = useState(false);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  
  const [accountForm, setAccountForm] = useState<PaymentAccount>({
    id: '',
    settlementName: '',
    accountNumber: '',
    bankName: '',
    bik: '',
    correspondentAccount: '',
    inn: '',
    kpp: '',
    recipientName: ''
  });

  const handleSaveSupplier = () => {
    setIsEditingSupplier(false);
  };

  const handleAddAccount = () => {
    setIsAddingAccount(true);
    setEditingAccountId(null);
    setAccountForm({
      id: '',
      settlementName: '',
      accountNumber: '',
      bankName: '',
      bik: '',
      correspondentAccount: '',
      inn: '',
      kpp: '',
      recipientName: ''
    });
  };

  const handleEditAccount = (account: PaymentAccount) => {
    setIsAddingAccount(false);
    setEditingAccountId(account.id);
    setAccountForm(account);
  };

  const handleSaveAccount = () => {
    if (!accountForm.settlementName.trim() || !accountForm.accountNumber.trim()) {
      alert('Заполните обязательные поля');
      return;
    }

    if (editingAccountId) {
      setAccounts(accounts.map(a => a.id === editingAccountId ? accountForm : a));
    } else {
      const newAccount: PaymentAccount = {
        ...accountForm,
        id: Date.now().toString()
      };
      setAccounts([...accounts, newAccount]);
    }

    setIsAddingAccount(false);
    setEditingAccountId(null);
    setAccountForm({
      id: '',
      settlementName: '',
      accountNumber: '',
      bankName: '',
      bik: '',
      correspondentAccount: '',
      inn: '',
      kpp: '',
      recipientName: ''
    });
  };

  const handleDeleteAccount = (id: string) => {
    if (confirm('Удалить расчетный счет?')) {
      setAccounts(accounts.filter(a => a.id !== id));
    }
  };

  const handleCancel = () => {
    setIsAddingAccount(false);
    setEditingAccountId(null);
    setAccountForm({
      id: '',
      settlementName: '',
      accountNumber: '',
      bankName: '',
      bik: '',
      correspondentAccount: '',
      inn: '',
      kpp: '',
      recipientName: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Supplier Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Реквизиты поставщика услуг
              </CardTitle>
              <CardDescription>
                Основная информация об организации
              </CardDescription>
            </div>
            {!isEditingSupplier ? (
              <Button
                onClick={() => setIsEditingSupplier(true)}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <Edit className="w-4 h-4 mr-2" />
                Редактировать
              </Button>
            ) : (
              <Button
                onClick={handleSaveSupplier}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Сохранить
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!isEditingSupplier ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Краткое наименование</p>
                <p className="text-sm">{supplierDetails.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Полное наименование</p>
                <p className="text-sm">{supplierDetails.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Адрес</p>
                <p className="text-sm">{supplierDetails.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Телефон</p>
                <p className="text-sm">{supplierDetails.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="text-sm">{supplierDetails.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Веб-сайт</p>
                <p className="text-sm">{supplierDetails.website}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Краткое наименование</Label>
                <Input
                  value={supplierDetails.name}
                  onChange={(e) => setSupplierDetails({ ...supplierDetails, name: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Полное наименование</Label>
                <Input
                  value={supplierDetails.fullName}
                  onChange={(e) => setSupplierDetails({ ...supplierDetails, fullName: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm text-gray-600 mb-2 block">Адрес</Label>
                <Input
                  value={supplierDetails.address}
                  onChange={(e) => setSupplierDetails({ ...supplierDetails, address: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Телефон</Label>
                <Input
                  value={supplierDetails.phone}
                  onChange={(e) => setSupplierDetails({ ...supplierDetails, phone: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Email</Label>
                <Input
                  value={supplierDetails.email}
                  onChange={(e) => setSupplierDetails({ ...supplierDetails, email: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm text-gray-600 mb-2 block">Веб-сайт</Label>
                <Input
                  value={supplierDetails.website}
                  onChange={(e) => setSupplierDetails({ ...supplierDetails, website: e.target.value })}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    Расчетные счета
                  </CardTitle>
                  <CardDescription>
                    Счета для оплаты по населенным пунктам
                  </CardDescription>
                </div>
                <Button
                  onClick={handleAddAccount}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {accounts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>Нет добавленных расчетных счетов</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {accounts.map((account) => (
                    <div
                      key={account.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-sm mb-1">{account.settlementName}</h4>
                            <Badge variant="outline" className="text-xs">
                              {account.accountNumber}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAccount(account)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAccount(account.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 ml-13">
                        <div>
                          <span className="text-gray-500">Банк:</span> {account.bankName}
                        </div>
                        <div>
                          <span className="text-gray-500">БИК:</span> {account.bik}
                        </div>
                        <div>
                          <span className="text-gray-500">ИНН:</span> {account.inn}
                        </div>
                        <div>
                          <span className="text-gray-500">КПП:</span> {account.kpp}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Account Form */}
        <div className="lg:sticky lg:top-4 h-fit">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {editingAccountId ? 'Редактировать счет' : isAddingAccount ? 'Новый счет' : 'Форма счета'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isAddingAccount && !editingAccountId ? (
                <div className="text-center py-12 text-gray-500">
                  <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p>Нажмите "Добавить" для создания нового счета</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Населенный пункт *</Label>
                    <Input
                      value={accountForm.settlementName}
                      onChange={(e) => setAccountForm({ ...accountForm, settlementName: e.target.value })}
                      placeholder="Например: г. Москва"
                    />
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Расчетный счет *</Label>
                    <Input
                      value={accountForm.accountNumber}
                      onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })}
                      placeholder="20 цифр"
                    />
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Наименование банка</Label>
                    <Input
                      value={accountForm.bankName}
                      onChange={(e) => setAccountForm({ ...accountForm, bankName: e.target.value })}
                      placeholder="Например: ПАО Сбербанк"
                    />
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">БИК</Label>
                    <Input
                      value={accountForm.bik}
                      onChange={(e) => setAccountForm({ ...accountForm, bik: e.target.value })}
                      placeholder="9 цифр"
                    />
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Корр. счет</Label>
                    <Input
                      value={accountForm.correspondentAccount}
                      onChange={(e) => setAccountForm({ ...accountForm, correspondentAccount: e.target.value })}
                      placeholder="20 цифр"
                    />
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">ИНН</Label>
                    <Input
                      value={accountForm.inn}
                      onChange={(e) => setAccountForm({ ...accountForm, inn: e.target.value })}
                      placeholder="10 или 12 цифр"
                    />
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">КПП</Label>
                    <Input
                      value={accountForm.kpp}
                      onChange={(e) => setAccountForm({ ...accountForm, kpp: e.target.value })}
                      placeholder="9 цифр"
                    />
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Получатель</Label>
                    <Input
                      value={accountForm.recipientName}
                      onChange={(e) => setAccountForm({ ...accountForm, recipientName: e.target.value })}
                      placeholder="Наименование получателя"
                    />
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
                      onClick={handleSaveAccount}
                      disabled={!accountForm.settlementName.trim() || !accountForm.accountNumber.trim()}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingAccountId ? 'Сохранить' : 'Добавить'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
