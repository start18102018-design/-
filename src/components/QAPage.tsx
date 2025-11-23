import { useState } from 'react';
import { MessageCircle, Send, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import type { User } from '../App';

interface Question {
  id: string;
  question: string;
  answer?: string;
  status: 'pending' | 'answered';
  date: string;
  userId: string;
}

interface QAPageProps {
  user: User;
}

const mockQuestions: Question[] = [
  {
    id: '1',
    question: 'Когда будет восстановлена подача горячей воды?',
    answer: 'Ремонтные работы завершатся 13 ноября к 18:00. Приносим извинения за неудобства.',
    status: 'answered',
    date: '2025-11-10',
    userId: 'user1'
  },
  {
    id: '2',
    question: 'Как оплатить счета через приложение?',
    answer: 'В разделе "Профиль" есть кнопка "Оплатить услуги". Вы можете оплатить картой или через СБП.',
    status: 'answered',
    date: '2025-11-09',
    userId: 'user1'
  },
  {
    id: '3',
    question: 'Почему увеличился тариф на электроэнергию?',
    status: 'pending',
    date: '2025-11-08',
    userId: 'user1'
  }
];

export function QAPage({ user }: QAPageProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newQuestion.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const question: Question = {
        id: Date.now().toString(),
        question: newQuestion,
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
        userId: 'user1'
      };
      
      setQuestions([question, ...questions]);
      setNewQuestion('');
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl">Вопросы и ответы</h2>
      </div>

      {/* Question Form */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
        <CardHeader>
          <CardTitle className="text-base">Задать вопрос</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              placeholder="Опишите вашу проблему или задайте вопрос..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              rows={4}
              disabled={isSubmitting}
            />
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting || !newQuestion.trim()}
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Отправка...' : 'Отправить вопрос'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Questions List */}
      <div className="space-y-3">
        <h3 className="text-sm text-gray-600">Мои вопросы</h3>
        
        {questions.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">У вас пока нет вопросов</p>
            </CardContent>
          </Card>
        ) : (
          questions.map((q) => (
            <Card key={q.id} className="border-l-4 border-l-blue-500">
              <CardContent className="pt-4 space-y-3">
                {/* Question */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge 
                      variant={q.status === 'answered' ? 'default' : 'secondary'}
                      className={q.status === 'answered' ? 'bg-green-500' : 'bg-gray-400'}
                    >
                      {q.status === 'answered' ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Отвечено
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 mr-1" />
                          Ожидает ответа
                        </>
                      )}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(q.date).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long'
                      })}
                    </span>
                  </div>
                  <p className="text-sm">
                    <span className="text-gray-600">Вопрос:</span> {q.question}
                  </p>
                </div>

                {/* Answer */}
                {q.answer && (
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <p className="text-sm">
                      <span className="text-blue-600">Ответ:</span> {q.answer}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}