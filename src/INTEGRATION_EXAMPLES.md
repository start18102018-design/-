# 🔌 Примеры интеграции защиты от спама и Rate Limiting

## 📋 Готовые примеры для всех форм приложения

---

## 1. ✅ AuthScreen - Форма входа (УЖЕНВНЕДРЕНО)

Форма входа уже защищена! Проверьте `/components/AuthScreen.tsx`:

- ✅ Rate Limiting для входа (5 попыток / 15 минут)
- ✅ CAPTCHA после 3 неудачных попыток
- ✅ Honeypot для ботов
- ✅ IP-based rate limiting
- ✅ Spam detection на email и имени

---

## 2. 📊 MetersPage - Передача показаний счетчиков

### Быстрая интеграция

Добавьте в `/components/pages/MetersPage.tsx`:

```tsx
import { useRateLimit } from '../../hooks/useRateLimit';
import { useSpamDetection } from '../../hooks/useSpamDetection';
import { RateLimitIndicator } from '../RateLimitIndicator';
import { SpamProtection } from '../SpamProtection';
import { ActionType } from '../../utils/antiSpam';

export function MetersPage({ user }: MetersPageProps) {
  // Добавить в начало компонента
  const rateLimit = useRateLimit(user.phone, ActionType.METER_SUBMISSION);
  const notesSpam = useSpamDetection(`${user.phone}-meter-notes`);

  const handleSubmitMeter = async () => {
    // Проверка rate limit
    if (!rateLimit.checkLimit()) {
      toast.error(rateLimit.message || 'Слишком много попыток отправки');
      return;
    }

    // Проверка спама в примечаниях (если есть)
    if (meterData.notes) {
      const spamCheck = notesSpam.checkContent(meterData.notes);
      if (spamCheck.isSpam) {
        toast.error(`Обнаружен спам: ${spamCheck.reason}`);
        rateLimit.recordAttempt(false);
        return;
      }
    }

    try {
      // Отправка показаний
      await submitMeterReadings(meterData);
      
      // Успех - сбросить лимит
      rateLimit.recordAttempt(true);
      toast.success('Показания успешно отправлены');
    } catch (error) {
      // Ошибка - увеличить счётчик
      rateLimit.recordAttempt(false);
      toast.error('Ошибка отправки показаний');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Индикатор rate limiting */}
      <RateLimitIndicator
        remainingAttempts={rateLimit.remainingAttempts}
        maxAttempts={5}
        isLocked={rateLimit.isLocked}
        lockoutTime={rateLimit.lockoutTime}
        actionType="отправки показаний"
      />

      {/* Индикатор спама (если есть) */}
      {notesSpam.isSpam && (
        <SpamProtection
          isSpam={notesSpam.isSpam}
          confidence={notesSpam.confidence}
          reason={notesSpam.reason}
        />
      )}

      {/* Остальная форма */}
      <Card>
        <CardContent>
          {/* ... поля формы ... */}
          
          <Button
            onClick={handleSubmitMeter}
            disabled={rateLimit.isLocked || notesSpam.isSpam}
          >
            Отправить показания
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 3. 🔧 RequestsPage - Подача заявок на ремонт

### Быстрая интеграция

Добавьте в `/components/pages/RequestsPage.tsx`:

```tsx
import { useRateLimit } from '../../hooks/useRateLimit';
import { useFormSpamProtection } from '../../hooks/useSpamDetection';
import { RateLimitIndicator } from '../RateLimitIndicator';
import { AntiSpamMonitor } from '../SpamProtection';
import { ActionType } from '../../utils/antiSpam';

export function RequestsPage({ user }: RequestsPageProps) {
  const rateLimit = useRateLimit(user.phone, ActionType.REQUEST_SUBMISSION);
  const spamProtection = useFormSpamProtection(user.phone);

  const handleSubmitRequest = async () => {
    // Проверка rate limit
    if (!rateLimit.checkLimit()) {
      toast.error(rateLimit.message || 'Превышен лимит заявок');
      return;
    }

    // Проверка на спам во всех полях
    const validation = spamProtection.validateFormData({
      title: requestData.title,
      description: requestData.description,
      location: requestData.location
    });

    if (!validation.isValid) {
      Object.entries(validation.errors).forEach(([field, error]) => {
        toast.error(`${field}: ${error}`);
      });
      rateLimit.recordAttempt(false);
      return;
    }

    try {
      await submitRepairRequest(requestData);
      rateLimit.recordAttempt(true);
      toast.success('Заявка успешно отправлена');
    } catch (error) {
      rateLimit.recordAttempt(false);
      toast.error('Ошибка отправки заявки');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Rate Limit */}
      <RateLimitIndicator
        remainingAttempts={rateLimit.remainingAttempts}
        maxAttempts={10}
        isLocked={rateLimit.isLocked}
        lockoutTime={rateLimit.lockoutTime}
        actionType="подачи заявок"
      />

      {/* Форма заявки */}
      <Card>
        <CardContent>
          <Input
            placeholder="Название заявки"
            value={requestData.title}
            onChange={(e) => setRequestData({...requestData, title: e.target.value})}
            disabled={rateLimit.isLocked}
          />

          <Textarea
            placeholder="Описание проблемы"
            value={requestData.description}
            onChange={(e) => setRequestData({...requestData, description: e.target.value})}
            disabled={rateLimit.isLocked}
          />

          <Button
            onClick={handleSubmitRequest}
            disabled={rateLimit.isLocked}
          >
            Отправить заявку
          </Button>
        </CardContent>
      </Card>

      {/* Монитор спама */}
      <AntiSpamMonitor
        totalBlocked={spamProtection.blockedCount}
        recentAttempts={spamProtection.recentAttempts}
        lastBlockedTime={spamProtection.lastBlockedTime}
      />
    </div>
  );
}
```

---

## 4. 💳 PaymentPage - Оплата счетов

### Быстрая интеграция

Добавьте в `/components/pages/PaymentPage.tsx`:

```tsx
import { useRateLimit } from '../../hooks/useRateLimit';
import { RateLimitIndicator } from '../RateLimitIndicator';
import { ActionType } from '../../utils/antiSpam';

export function PaymentPage({ user }: PaymentPageProps) {
  const rateLimit = useRateLimit(user.phone, ActionType.PAYMENT);

  const handlePayment = async () => {
    // Критично важная проверка для платежей!
    if (!rateLimit.checkLimit()) {
      toast.error('Превышен лимит попыток оплаты. Попробуйте позже.');
      return;
    }

    try {
      await processPayment(paymentData);
      rateLimit.recordAttempt(true);
      toast.success('Оплата успешно проведена');
    } catch (error) {
      rateLimit.recordAttempt(false);
      toast.error('Ошибка проведения оплаты');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Очень важно показывать для платежей! */}
      <RateLimitIndicator
        remainingAttempts={rateLimit.remainingAttempts}
        maxAttempts={5}
        isLocked={rateLimit.isLocked}
        lockoutTime={rateLimit.lockoutTime}
        actionType="попыток оплаты"
      />

      <Card>
        <CardContent>
          {/* Форма оплаты */}
          
          <Button
            onClick={handlePayment}
            disabled={rateLimit.isLocked}
          >
            Оплатить
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 5. 📢 AdminPanel - Создание объявлений

### Быстрая интеграция

Добавьте в `/components/admin/AdminPanel.tsx`:

```tsx
import { useRateLimit } from '../../hooks/useRateLimit';
import { useSpamDetection } from '../../hooks/useSpamDetection';
import { RateLimitIndicator } from '../RateLimitIndicator';
import { SpamProtection } from '../SpamProtection';
import { ActionType } from '../../utils/antiSpam';

export function AdminPanel() {
  const [adminId] = useState('admin'); // или реальный ID админа
  
  const rateLimit = useRateLimit(adminId, ActionType.FORM_SUBMISSION);
  const titleSpam = useSpamDetection(`${adminId}-announcement-title`);
  const contentSpam = useSpamDetection(`${adminId}-announcement-content`);

  const handleCreateAnnouncement = async () => {
    // Rate limit
    if (!rateLimit.checkLimit()) {
      toast.error('Слишком много попыток создания объявлений');
      return;
    }

    // Spam check
    const titleCheck = titleSpam.checkContent(announcementData.title);
    if (titleCheck.isSpam) {
      toast.error(`Спам в заголовке: ${titleCheck.reason}`);
      rateLimit.recordAttempt(false);
      return;
    }

    const contentCheck = contentSpam.checkContent(announcementData.content);
    if (contentCheck.isSpam) {
      toast.error(`Спам в тексте: ${contentCheck.reason}`);
      rateLimit.recordAttempt(false);
      return;
    }

    try {
      await createAnnouncement(announcementData);
      rateLimit.recordAttempt(true);
      toast.success('Объявление создано');
    } catch (error) {
      rateLimit.recordAttempt(false);
      toast.error('Ошибка создания');
    }
  };

  return (
    <div className="space-y-6">
      {/* Rate Limit Indicator */}
      <RateLimitIndicator
        remainingAttempts={rateLimit.remainingAttempts}
        maxAttempts={20}
        isLocked={rateLimit.isLocked}
      />

      <Card>
        <CardHeader>
          <CardTitle>Создать объявление</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Заголовок</Label>
            <Input
              value={announcementData.title}
              onChange={(e) => setAnnouncementData({
                ...announcementData,
                title: e.target.value
              })}
            />
            {titleSpam.isSpam && (
              <SpamProtection
                isSpam={true}
                confidence={titleSpam.confidence}
                reason={titleSpam.reason}
              />
            )}
          </div>

          <div>
            <Label>Текст</Label>
            <Textarea
              value={announcementData.content}
              onChange={(e) => setAnnouncementData({
                ...announcementData,
                content: e.target.value
              })}
            />
            {contentSpam.isSpam && (
              <SpamProtection
                isSpam={true}
                confidence={contentSpam.confidence}
                reason={contentSpam.reason}
              />
            )}
          </div>

          <Button
            onClick={handleCreateAnnouncement}
            disabled={
              rateLimit.isLocked || 
              titleSpam.isSpam || 
              contentSpam.isSpam
            }
          >
            Создать
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 6. 📊 SecurityDashboard в AdminPanel

### Добавить вкладку безопасности

Обновите `/components/admin/AdminPanel.tsx`:

```tsx
import { SecurityDashboard } from '../SecurityDashboard';
import { Shield } from 'lucide-react';

export function AdminPanel() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Tabs defaultValue="announcements">
        <TabsList>
          <TabsTrigger value="announcements">Объявления</TabsTrigger>
          <TabsTrigger value="requests">Заявки</TabsTrigger>
          <TabsTrigger value="meters">Показания</TabsTrigger>
          <TabsTrigger value="users">Пользователи</TabsTrigger>
          
          {/* НОВАЯ ВКЛАДКА */}
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Безопасность
          </TabsTrigger>
        </TabsList>

        {/* ... существующие вкладки ... */}

        {/* НОВЫЙ КОНТЕНТ */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Панель безопасности
              </CardTitle>
              <CardDescription>
                Мониторинг защиты от спама и rate limiting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SecurityDashboard />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## 7. 🎯 Использование ProtectedForm (самый простой способ)

### Для любой формы

```tsx
import { ProtectedForm } from '../components/ProtectedForm';
import { ActionType } from '../utils/antiSpam';

function MyForm({ user }) {
  const handleSubmit = async (formData: any) => {
    // Ваша логика отправки
    console.log('Submit:', formData);
  };

  return (
    <ProtectedForm
      identifier={user.phone}
      actionType={ActionType.FORM_SUBMISSION}
      onSubmit={handleSubmit}
      submitButtonText="Отправить"
      checkSpam={true}
      spamCheckFields={['message', 'comment']}
      showSecurityIndicators={true}
    >
      {({ formData, updateFormData, isSubmitting }) => (
        <>
          <Input
            value={formData.message || ''}
            onChange={(e) => updateFormData('message', e.target.value)}
            disabled={isSubmitting}
            placeholder="Сообщение"
          />
          
          <Textarea
            value={formData.comment || ''}
            onChange={(e) => updateFormData('comment', e.target.value)}
            disabled={isSubmitting}
            placeholder="Комментарий"
          />
        </>
      )}
    </ProtectedForm>
  );
}
```

---

## 8. 📱 QAPage - Вопросы и ответы

### Быстрая интеграция

```tsx
import { useFormSpamProtection } from '../../hooks/useSpamDetection';
import { useRateLimit } from '../../hooks/useRateLimit';
import { ActionType } from '../../utils/antiSpam';

export function QAPage({ user }: QAPageProps) {
  const rateLimit = useRateLimit(user.phone, ActionType.FORM_SUBMISSION);
  const spamProtection = useFormSpamProtection(user.phone);

  const handleSubmitQuestion = async () => {
    if (!rateLimit.checkLimit()) {
      toast.error('Слишком много вопросов за короткое время');
      return;
    }

    const validation = spamProtection.validateFormData({
      question: questionData.question
    });

    if (!validation.isValid) {
      toast.error('Обнаружен спам в вопросе');
      rateLimit.recordAttempt(false);
      return;
    }

    try {
      await submitQuestion(questionData);
      rateLimit.recordAttempt(true);
      toast.success('Вопрос отправлен');
    } catch (error) {
      rateLimit.recordAttempt(false);
    }
  };

  return (
    <div className="space-y-6">
      <RateLimitIndicator
        remainingAttempts={rateLimit.remainingAttempts}
        maxAttempts={20}
        isLocked={rateLimit.isLocked}
      />
      
      {/* Форма вопроса */}
    </div>
  );
}
```

---

## 🔥 Быстрый старт (копируй-вставляй)

### Минимальная интеграция за 5 минут

1. **Импорты:**
```tsx
import { useRateLimit } from '../hooks/useRateLimit';
import { RateLimitIndicator } from './RateLimitIndicator';
import { ActionType } from '../utils/antiSpam';
```

2. **В компоненте:**
```tsx
const rateLimit = useRateLimit(user.phone, ActionType.FORM_SUBMISSION);
```

3. **Перед submit:**
```tsx
if (!rateLimit.checkLimit()) {
  toast.error('Слишком много попыток');
  return;
}
```

4. **После submit:**
```tsx
rateLimit.recordAttempt(success); // true или false
```

5. **В JSX:**
```tsx
<RateLimitIndicator
  remainingAttempts={rateLimit.remainingAttempts}
  maxAttempts={5}
  isLocked={rateLimit.isLocked}
/>
```

---

## 📦 Полный пример компонента

```tsx
import { useState } from 'react';
import { useRateLimit } from '../hooks/useRateLimit';
import { useSpamDetection } from '../hooks/useSpamDetection';
import { RateLimitIndicator } from './RateLimitIndicator';
import { SpamProtection } from './SpamProtection';
import { ActionType } from '../utils/antiSpam';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';

export function ExampleProtectedForm({ user }) {
  const [formData, setFormData] = useState({
    title: '',
    message: ''
  });

  // Rate Limiting
  const rateLimit = useRateLimit(user.phone, ActionType.FORM_SUBMISSION);
  
  // Spam Detection
  const titleSpam = useSpamDetection(`${user.phone}-title`);
  const messageSpam = useSpamDetection(`${user.phone}-message`);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Проверка Rate Limit
    if (!rateLimit.checkLimit()) {
      toast.error(rateLimit.message || 'Превышен лимит попыток');
      return;
    }

    // 2. Проверка спама
    const titleCheck = titleSpam.checkContent(formData.title);
    const messageCheck = messageSpam.checkContent(formData.message);

    if (titleCheck.isSpam || messageCheck.isSpam) {
      toast.error('Обнаружен спам');
      rateLimit.recordAttempt(false);
      return;
    }

    // 3. Отправка
    try {
      await submitForm(formData);
      rateLimit.recordAttempt(true);
      toast.success('Успешно отправлено');
      setFormData({ title: '', message: '' });
    } catch (error) {
      rateLimit.recordAttempt(false);
      toast.error('Ошибка отправки');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Security Indicators */}
      <RateLimitIndicator
        remainingAttempts={rateLimit.remainingAttempts}
        maxAttempts={20}
        isLocked={rateLimit.isLocked}
        lockoutTime={rateLimit.lockoutTime}
      />

      {/* Form Fields */}
      <div className="space-y-4">
        <div>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Заголовок"
            disabled={rateLimit.isLocked}
          />
          {titleSpam.isSpam && (
            <SpamProtection
              isSpam={true}
              confidence={titleSpam.confidence}
              reason={titleSpam.reason}
            />
          )}
        </div>

        <div>
          <Textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Сообщение"
            disabled={rateLimit.isLocked}
          />
          {messageSpam.isSpam && (
            <SpamProtection
              isSpam={true}
              confidence={messageSpam.confidence}
              reason={messageSpam.reason}
            />
          )}
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={
          rateLimit.isLocked ||
          titleSpam.isSpam ||
          messageSpam.isSpam
        }
        className="w-full"
      >
        Отправить
      </Button>
    </form>
  );
}
```

---

## ✅ Чеклист интеграции

- [ ] Импортировать необходимые хуки и компоненты
- [ ] Добавить `useRateLimit` в компонент
- [ ] Добавить `useSpamDetection` для текстовых полей (опционально)
- [ ] Проверить `rateLimit.checkLimit()` перед submit
- [ ] Вызвать `rateLimit.recordAttempt(success)` после submit
- [ ] Добавить `<RateLimitIndicator />` в JSX
- [ ] Добавить `<SpamProtection />` при необходимости
- [ ] Добавить `disabled={rateLimit.isLocked}` на кнопку submit
- [ ] Протестировать блокировку
- [ ] Протестировать разблокировку по времени

---

**Готово!** 🎉 Теперь все формы защищены от спама и имеют Rate Limiting!
