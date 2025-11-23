import { useState } from 'react';
import { Wrench, Search, Edit, CheckCircle, Clock, XCircle, FileDown, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { SETTLEMENTS } from '../../utils/settlements';

interface Request {
  id: string;
  userId: string;
  userAddress: string;
  userSettlement: string;
  type: string;
  description: string;
  createdDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  // Данные об исполнении
  completedDate?: string;
  cost?: number;
  timeSpent?: number; // в часах
  workers?: string; // ФИО через запятую
  transport?: string;
  notes?: string;
}

const statusConfig = {
  pending: { label: 'На рассмотрении', color: 'bg-yellow-500', textColor: 'text-yellow-600', icon: Clock },
  in_progress: { label: 'В работе', color: 'bg-blue-500', textColor: 'text-blue-600', icon: Clock },
  completed: { label: 'Выполнено', color: 'bg-green-500', textColor: 'text-green-600', icon: CheckCircle },
  rejected: { label: 'Отклонено', color: 'bg-red-500', textColor: 'text-red-600', icon: XCircle }
};

export function AdminRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [settlementFilter, setSettlementFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [executionForm, setExecutionForm] = useState({
    status: 'pending' as Request['status'],
    cost: '',
    timeSpent: '',
    workers: '',
    transport: '',
    notes: ''
  });

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.id.includes(searchTerm) ||
      request.userAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSettlement = !settlementFilter || request.userSettlement === settlementFilter;
    const matchesStatus = !statusFilter || request.status === statusFilter;
    
    const requestDate = new Date(request.createdDate);
    const matchesDateFrom = !dateFrom || requestDate >= new Date(dateFrom);
    const matchesDateTo = !dateTo || requestDate <= new Date(dateTo);
    
    return matchesSearch && matchesSettlement && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  const handleSelectRequest = (request: Request) => {
    setSelectedRequest(request);
    setExecutionForm({
      status: request.status,
      cost: request.cost?.toString() || '',
      timeSpent: request.timeSpent?.toString() || '',
      workers: request.workers || '',
      transport: request.transport || '',
      notes: request.notes || ''
    });
  };

  const handleSaveExecution = () => {
    if (!selectedRequest) return;

    const updatedRequest: Request = {
      ...selectedRequest,
      status: executionForm.status,
      cost: executionForm.cost ? parseFloat(executionForm.cost) : undefined,
      timeSpent: executionForm.timeSpent ? parseFloat(executionForm.timeSpent) : undefined,
      workers: executionForm.workers || undefined,
      transport: executionForm.transport || undefined,
      notes: executionForm.notes || undefined,
      completedDate: executionForm.status === 'completed' ? new Date().toISOString() : undefined
    };

    setRequests(requests.map(r => r.id === selectedRequest.id ? updatedRequest : r));
    setSelectedRequest(updatedRequest);
  };

  const exportToCSV = () => {
    const headers = [
      'Номер заявки',
      'Дата создания',
      'Населенный пункт',
      'Адрес',
      'Тип',
      'Описание',
      'Статус',
      'Дата выполнения',
      'Стоимость (руб)',
      'Время (часов)',
      'Работники',
      'Транспорт',
      'Примечания'
    ];

    const rows = filteredRequests.map(r => [
      r.id,
      new Date(r.createdDate).toLocaleString('ru-RU'),
      r.userSettlement,
      r.userAddress,
      r.type,
      `"${r.description.replace(/"/g, '""')}"`,
      statusConfig[r.status].label,
      r.completedDate ? new Date(r.completedDate).toLocaleString('ru-RU') : '',
      r.cost || '',
      r.timeSpent || '',
      r.workers || '',
      r.transport || '',
      r.notes ? `"${r.notes.replace(/"/g, '""')}"` : ''
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `zayvki_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    // Простой экспорт в формате HTML table, который Excel может открыть
    const headers = [
      'Номер заявки',
      'Дата создания',
      'Населенный пункт',
      'Адрес',
      'Тип',
      'Описание',
      'Статус',
      'Дата выполнения',
      'Стоимость (руб)',
      'Время (часов)',
      'Работники',
      'Транспорт',
      'Примечания'
    ];

    const rows = filteredRequests.map(r => [
      r.id,
      new Date(r.createdDate).toLocaleString('ru-RU'),
      r.userSettlement,
      r.userAddress,
      r.type,
      r.description,
      statusConfig[r.status].label,
      r.completedDate ? new Date(r.completedDate).toLocaleString('ru-RU') : '',
      r.cost || '',
      r.timeSpent || '',
      r.workers || '',
      r.transport || '',
      r.notes || ''
    ]);

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4CAF50; color: white; }
          </style>
        </head>
        <body>
          <table>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
            ${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `zayvki_${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Stats */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Всего заявок</p>
                <p className="text-2xl">{requests.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Wrench className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">На рассмотрении</p>
                <p className="text-2xl text-yellow-600">
                  {requests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">В работе</p>
                <p className="text-2xl text-blue-600">
                  {requests.filter(r => r.status === 'in_progress').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Выполнено</p>
                <p className="text-2xl text-green-600">
                  {requests.filter(r => r.status === 'completed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle>Журнал заявок на ремонт</CardTitle>
                <CardDescription>Управление заявками от потребителей</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={exportToCSV}
                  variant="outline"
                  size="sm"
                  disabled={filteredRequests.length === 0}
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  CSV
                </Button>
                <Button
                  onClick={exportToExcel}
                  variant="outline"
                  size="sm"
                  disabled={filteredRequests.length === 0}
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
            
            {/* Filters */}
            <div className="space-y-3 mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Поиск по номеру, адресу, описанию..."
                  className="pl-10"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={settlementFilter}
                  onChange={(e) => setSettlementFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Все населенные пункты</option>
                  {SETTLEMENTS.map(settlement => (
                    <option key={settlement} value={settlement}>{settlement}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Все статусы</option>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">От:</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">До:</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredRequests.map((request) => {
                const config = statusConfig[request.status];
                const StatusIcon = config.icon;

                return (
                  <button
                    key={request.id}
                    onClick={() => handleSelectRequest(request)}
                    className={`w-full text-left p-4 border rounded-lg transition-all ${
                      selectedRequest?.id === request.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm">Заявка #{request.id.slice(-6)}</span>
                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${config.color} text-white text-xs`}>
                            <StatusIcon className="w-3 h-3" />
                            <span>{config.label}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">{request.type}</Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">{request.userSettlement}</p>
                        <p className="text-xs text-gray-500">{request.userAddress}</p>
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">{request.description}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(request.createdDate).toLocaleString('ru-RU', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}

              {filteredRequests.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>Заявки не найдены</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request Details */}
      <div className="lg:sticky lg:top-4 h-fit">
        {selectedRequest ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Детали заявки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Request Info */}
              <div className="pb-4 border-b border-gray-200">
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Номер заявки:</p>
                    <p>#{selectedRequest.id.slice(-6)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Дата создания:</p>
                    <p>{new Date(selectedRequest.createdDate).toLocaleString('ru-RU')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Населенный пункт:</p>
                    <p>{selectedRequest.userSettlement}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Адрес:</p>
                    <p>{selectedRequest.userAddress}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Тип:</p>
                    <Badge variant="outline">{selectedRequest.type}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Описание:</p>
                    <p className="text-gray-700">{selectedRequest.description}</p>
                  </div>
                </div>
              </div>

              {/* Execution Form */}
              <div className="space-y-3">
                <h4 className="text-sm">Данные об исполнении</h4>

                <div className="space-y-2">
                  <Label className="text-xs">Статус *</Label>
                  <select
                    value={executionForm.status}
                    onChange={(e) => setExecutionForm({ ...executionForm, status: e.target.value as Request['status'] })}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Стоимость услуг (руб)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={executionForm.cost}
                    onChange={(e) => setExecutionForm({ ...executionForm, cost: e.target.value })}
                    placeholder="0.00"
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Время затрачено (часов)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={executionForm.timeSpent}
                    onChange={(e) => setExecutionForm({ ...executionForm, timeSpent: e.target.value })}
                    placeholder="0.0"
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">ФИО работников</Label>
                  <Input
                    value={executionForm.workers}
                    onChange={(e) => setExecutionForm({ ...executionForm, workers: e.target.value })}
                    placeholder="Иванов И.И., Петров П.П."
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Транспорт</Label>
                  <Input
                    value={executionForm.transport}
                    onChange={(e) => setExecutionForm({ ...executionForm, transport: e.target.value })}
                    placeholder="ГАЗель А123БВ"
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Примечания</Label>
                  <Textarea
                    value={executionForm.notes}
                    onChange={(e) => setExecutionForm({ ...executionForm, notes: e.target.value })}
                    placeholder="Дополнительная информация..."
                    rows={3}
                    className="resize-none text-sm"
                  />
                </div>

                <Button
                  onClick={handleSaveExecution}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Сохранить данные
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Детали заявки</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p>Выберите заявку из списка</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
