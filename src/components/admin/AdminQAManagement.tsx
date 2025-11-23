import { useState } from 'react';
import { MessageCircle, Send, Clock, CheckCircle, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';

interface Question {
  id: string;
  userId: string;
  userName: string;
  userAddress: string;
  question: string;
  answer?: string;
  askedDate: string;
  answeredDate?: string;
  status: 'pending' | 'answered';
}

export function AdminQAManagement() {
  const [questions, setQuestions] = useState<Question[]>([]);

  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [answerText, setAnswerText] = useState('');

  const pendingQuestions = questions.filter(q => q.status === 'pending');
  const answeredQuestions = questions.filter(q => q.status === 'answered');

  const handleSelectQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setAnswerText(question.answer || '');
  };

  const handleSendAnswer = () => {
    if (!selectedQuestion || !answerText.trim()) return;

    const updatedQuestions = questions.map(q => {
      if (q.id === selectedQuestion.id) {
        return {
          ...q,
          answer: answerText,
          status: 'answered' as const,
          answeredDate: new Date().toISOString()
        };
      }
      return q;
    });

    setQuestions(updatedQuestions);
    setSelectedQuestion(null);
    setAnswerText('');
  };

  const templateAnswers = [
    'Для передачи показаний перейдите в раздел "Счетчики" в нижнем меню приложения.',
    'Перерасчет будет произведен в течение 10 рабочих дней после подачи заявления.',
    'Квитанции формируются до 5 числа каждого месяца.',
    'Вы можете оплатить услуги через раздел "Квитанции" в приложении.',
    'Для получения справки обратитесь в офис обслуживания клиентов.'
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Questions List */}
      <div className="space-y-4">
        {/* Pending Questions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Ожидают ответа</CardTitle>
              <Badge className="bg-orange-500">
                {pendingQuestions.length}
              </Badge>
            </div>
            <CardDescription>
              Вопросы, требующие вашего ответа
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingQuestions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
                <p>Все вопросы обработаны</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingQuestions.map((question) => (
                  <button
                    key={question.id}
                    onClick={() => handleSelectQuestion(question)}
                    className={`w-full text-left p-4 border rounded-lg transition-all ${
                      selectedQuestion?.id === question.id
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm">{question.userName}</p>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(question.askedDate).toLocaleDateString('ru-RU')}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{question.userAddress}</p>
                        <p className="text-sm text-gray-700 line-clamp-2">{question.question}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Answered Questions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Отвеченные</CardTitle>
              <Badge className="bg-green-500">
                {answeredQuestions.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {answeredQuestions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>Нет отвеченных вопросов</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {answeredQuestions.map((question) => (
                  <button
                    key={question.id}
                    onClick={() => handleSelectQuestion(question)}
                    className={`w-full text-left p-4 border rounded-lg transition-all ${
                      selectedQuestion?.id === question.id
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm">{question.userName}</p>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">{question.question}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Answer Panel */}
      <div className="lg:sticky lg:top-4 h-fit">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {selectedQuestion ? 'Ответ на вопрос' : 'Выберите вопрос'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedQuestion ? (
              <div className="text-center py-12 text-gray-500">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p>Выберите вопрос из списка слева</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Question Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">{selectedQuestion.userName}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{selectedQuestion.userAddress}</p>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-sm text-gray-700">{selectedQuestion.question}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(selectedQuestion.askedDate).toLocaleString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Template Answers */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Шаблоны ответов:</p>
                  <div className="space-y-2">
                    {templateAnswers.map((template, index) => (
                      <button
                        key={index}
                        onClick={() => setAnswerText(template)}
                        className="w-full text-left text-xs p-2 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                      >
                        {template}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Answer Input */}
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Ваш ответ:</label>
                  <Textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Введите ответ на вопрос..."
                    rows={6}
                    className="resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setSelectedQuestion(null);
                      setAnswerText('');
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Отмена
                  </Button>
                  <Button
                    onClick={handleSendAnswer}
                    disabled={!answerText.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Отправить ответ
                  </Button>
                </div>

                {selectedQuestion.status === 'answered' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-900">Ответ отправлен</span>
                    </div>
                    <p className="text-sm text-green-800">{selectedQuestion.answer}</p>
                    <p className="text-xs text-green-600 mt-2">
                      {selectedQuestion.answeredDate && new Date(selectedQuestion.answeredDate).toLocaleString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}