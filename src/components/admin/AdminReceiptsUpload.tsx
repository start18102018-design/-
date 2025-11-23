import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Download, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface UploadedReceipt {
  id: string;
  fileName: string;
  uploadDate: string;
  recordsCount: number;
  status: 'processing' | 'success' | 'error';
  errorMessage?: string;
}

export function AdminReceiptsUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedReceipt[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Симуляция загрузки и обработки файла
    setTimeout(() => {
      const newReceipt: UploadedReceipt = {
        id: Date.now().toString(),
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        recordsCount: Math.floor(Math.random() * 500) + 1000,
        status: 'success'
      };

      setUploadedFiles([newReceipt, ...uploadedFiles]);
      setIsUploading(false);
      event.target.value = '';
    }, 2000);
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить загруженный файл?')) {
      setUploadedFiles(uploadedFiles.filter(f => f.id !== id));
    }
  };

  const handleDownloadTemplate = () => {
    alert('Скачивание шаблона Excel для загрузки квитанций');
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="border-2 border-dashed border-purple-300 bg-purple-50">
        <CardHeader>
          <CardTitle>Загрузка квитанций из 1С</CardTitle>
          <CardDescription>
            Загрузите файл Excel (.xlsx) или CSV (.csv) с данными квитанций
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex-1">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
              <div className="flex items-center justify-center gap-3 p-8 border-2 border-dashed border-purple-300 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-purple-600" />
                <div className="text-center">
                  <p className="text-sm text-gray-700">
                    {isUploading ? 'Загрузка файла...' : 'Нажмите для выбора файла'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Поддерживаются форматы: XLSX, XLS, CSV
                  </p>
                </div>
              </div>
            </label>
          </div>

          <Button
            variant="outline"
            onClick={handleDownloadTemplate}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Скачать шаблон для загрузки
          </Button>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm mb-2 text-blue-900">Формат файла:</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• <strong>Лицевой счет</strong> - номер лицевого счета</li>
              <li>• <strong>Период</strong> - месяц и год (например: Ноябрь 2025)</li>
              <li>• <strong>Холодная вода</strong> - начисление за холодную воду</li>
              <li>• <strong>Горячая вода</strong> - начисление за горячую воду</li>
              <li>• <strong>Отопление</strong> - начисление за отопление</li>
              <li>• <strong>Водоотведение</strong> - начисление за водоотведение</li>
              <li>• <strong>Итого</strong> - общая сумма</li>
              <li>• <strong>Срок оплаты</strong> - дата до которой нужно оплатить</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      <Card>
        <CardHeader>
          <CardTitle>История загрузок</CardTitle>
          <CardDescription>
            Загруженные файлы квитанций
          </CardDescription>
        </CardHeader>
        <CardContent>
          {uploadedFiles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>Нет загруженных файлов</p>
            </div>
          ) : (
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm truncate">{file.fileName}</p>
                      {file.status === 'success' && (
                        <Badge className="bg-green-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Успешно
                        </Badge>
                      )}
                      {file.status === 'processing' && (
                        <Badge className="bg-blue-500">Обработка</Badge>
                      )}
                      {file.status === 'error' && (
                        <Badge className="bg-red-500">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Ошибка
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        {new Date(file.uploadDate).toLocaleString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span>Записей: {file.recordsCount}</span>
                    </div>
                    {file.errorMessage && (
                      <p className="text-xs text-red-600 mt-1">{file.errorMessage}</p>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(file.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}