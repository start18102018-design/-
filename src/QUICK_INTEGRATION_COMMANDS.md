# ⚡ Быстрая интеграция - Готовые команды

## 🎯 Копируй-Вставляй код для каждой страницы

---

## 1. MetersPage - Передача показаний

### Импорты (добавить в начало файла)
```typescript
import { useRateLimit } from '../../hooks/useRateLimit';
import { useSpamDetection } from '../../hooks/useSpamDetection';
import { RateLimitIndicator } from '../RateLimitIndicator';
import { SpamProtection } from '../SpamProtection';
import { ActionType } from '../../utils/antiSpam';
```

### Хуки (добавить в компонент)
```typescript
// В начало компонента MetersPage
const rateLimit = useRateLimit(user.phone, ActionType.METER_SUBMISSION);
const notesSpam = useSpamDetection(`${user.phone}-meter-notes`);
```

### Обработчик отправки (обновить функцию)
```typescript
const handleSubmitMeter = async () => {
  // Проверка rate limit
  if (!rateLimit.checkLimit()) {
    toast.error(rateLimit.message || 'Слишком много попыток отправки показаний');
    return;
  }

  // Проверка спама в примечаниях (если есть)
  if (meterData.notes && meterData.notes.trim().length > 0) {
    const spamCheck = notesSpam.checkContent(meterData.notes);
    if (spamCheck.isSpam) {
      toast.error(`Обнаружен спам в примечаниях: ${spamCheck.reason}`);
      rateLimit.recordAttempt(false);
      return;
    }
  }

  try {
    // Существующая логика отправки
    // ... ваш код отправки показаний ...
    
    // Успех - сбросить лимит
    rateLimit.recordAttempt(true);
    toast.success('Показания успешно отправлены');
  } catch (error) {
    // Ошибка - увеличить счётчик
    rateLimit.recordAttempt(false);
    toast.error('Ошибка отправки показаний');
  }
};
```

### Индикаторы (добавить в JSX перед формой)
```tsx
{/* Индикатор rate limiting */}
<RateLimitIndicator
  remainingAttempts={rateLimit.remainingAttempts}
  maxAttempts={5}
  isLocked={rateLimit.isLocked}
  lockoutTime={rateLimit.lockoutTime}
  actionType="отправки показаний"
/>

{/* Индикатор спама (если обнаружен) */}
{notesSpam.isSpam && (
  <SpamProtection
    isSpam={notesSpam.isSpam}
    confidence={notesSpam.confidence}
    reason={notesSpam.reason}
  />
)}
```

### Disabled кнопки (обновить кнопку отправки)
```tsx
<Button
  onClick={handleSubmitMeter}
  disabled={rateLimit.isLocked || notesSpam.isSpam}
  className="w-full"
>
  Отправить показания
</Button>
```

---

## 2. RequestsPage - Заявки на ремонт

### Импорты
```typescript
import { useRateLimit } from '../../hooks/useRateLimit';
import { useFormSpamProtection } from '../../hooks/useSpamDetection';
import { RateLimitIndicator } from '../RateLimitIndicator';
import { AntiSpamMonitor } from '../SpamProtection';
import { ActionType } from '../../utils/antiSpam';
```

### Хуки
```typescript
const rateLimit = useRateLimit(user.phone, ActionType.REQUEST_SUBMISSION);
const spamProtection = useFormSpamProtection(user.phone);
```

### Обработчик
```typescript
const handleSubmitRequest = async () => {
  // Rate limit
  if (!rateLimit.checkLimit()) {
    toast.error(rateLimit.message || 'Превышен лимит заявок на сегодня');
    return;
  }

  // Spam check
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
    // Ваша логика отправки заявки
    // ... ваш код ...
    
    rateLimit.recordAttempt(true);
    toast.success('Заявка успешно отправлена');
  } catch (error) {
    rateLimit.recordAttempt(false);
    toast.error('Ошибка отправки заявки');
  }
};
```

### Индикаторы
```tsx
<RateLimitIndicator
  remainingAttempts={rateLimit.remainingAttempts}
  maxAttempts={10}
  isLocked={rateLimit.isLocked}
  lockoutTime={rateLimit.lockoutTime}
  actionType="подачи заявок"
/>

{/* Монитор спама (плавающий) */}
<AntiSpamMonitor
  totalBlocked={spamProtection.blockedCount}
  recentAttempts={spamProtection.recentAttempts}
  lastBlockedTime={spamProtection.lastBlockedTime}
/>
```

### Disabled кнопки
```tsx
<Button
  onClick={handleSubmitRequest}
  disabled={rateLimit.isLocked}
>
  Отправить заявку
</Button>
```

---

## 3. PaymentPage - Оплата

### Импорты
```typescript
import { useRateLimit } from '../../hooks/useRateLimit';
import { RateLimitIndicator } from '../RateLimitIndicator';
import { ActionType } from '../../utils/antiSpam';
```

### Хуки
```typescript
const rateLimit = useRateLimit(user.phone, ActionType.PAYMENT);
```

### Обработчик
```typescript
const handlePayment = async () => {
  // КРИТИЧНО для платежей!
  if (!rateLimit.checkLimit()) {
    toast.error('Превышен лимит попыток оплаты. Попробуйте позже.');
    return;
  }

  try {
    // Ваша логика оплаты
    // ... ваш код ...
    
    rateLimit.recordAttempt(true);
    toast.success('Оплата успешно проведена');
  } catch (error) {
    rateLimit.recordAttempt(false);
    toast.error('Ошибка проведения оплаты');
  }
};
```

### Индикаторы
```tsx
{/* Очень важно для платежей! */}
<RateLimitIndicator
  remainingAttempts={rateLimit.remainingAttempts}
  maxAttempts={5}
  isLocked={rateLimit.isLocked}
  lockoutTime={rateLimit.lockoutTime}
  actionType="попыток оплаты"
/>
```

### Disabled кнопки
```tsx
<Button
  onClick={handlePayment}
  disabled={rateLimit.isLocked}
>
  Оплатить
</Button>
```

---

## 4. QAPage - Вопросы и ответы

### Импорты
```typescript
import { useRateLimit } from '../../hooks/useRateLimit';
import { useSpamDetection } from '../../hooks/useSpamDetection';
import { RateLimitIndicator } from '../RateLimitIndicator';
import { SpamProtection } from '../SpamProtection';
import { ActionType } from '../../utils/antiSpam';
```

### Хуки
```typescript
const rateLimit = useRateLimit(user.phone, ActionType.FORM_SUBMISSION);
const questionSpam = useSpamDetection(`${user.phone}-question`);
```

### Обработчик
```typescript
const handleSubmitQuestion = async () => {
  if (!rateLimit.checkLimit()) {
    toast.error('Слишком много вопросов за короткое время');
    return;
  }

  const spamCheck = questionSpam.checkContent(questionData.question);
  if (spamCheck.isSpam) {
    toast.error(`Обнаружен спам: ${spamCheck.reason}`);
    rateLimit.recordAttempt(false);
    return;
  }

  try {
    // Ваша логика отправки вопроса
    // ... ваш код ...
    
    rateLimit.recordAttempt(true);
    toast.success('Вопрос отправлен');
  } catch (error) {
    rateLimit.recordAttempt(false);
    toast.error('Ошибка отправки вопроса');
  }
};
```

### Индикаторы
```tsx
<RateLimitIndicator
  remainingAttempts={rateLimit.remainingAttempts}
  maxAttempts={20}
  isLocked={rateLimit.isLocked}
/>

{questionSpam.isSpam && (
  <SpamProtection
    isSpam={true}
    confidence={questionSpam.confidence}
    reason={questionSpam.reason}
  />
)}
```

---

## 5. AdminPanel - Объявления

### Импорты
```typescript
import { useRateLimit } from '../../hooks/useRateLimit';
import { useSpamDetection } from '../../hooks/useSpamDetection';
import { RateLimitIndicator } from '../RateLimitIndicator';
import { SpamProtection } from '../SpamProtection';
import { SecurityDashboard } from '../SecurityDashboard';
import { ActionType } from '../../utils/antiSpam';
```

### Хуки
```typescript
const [adminId] = useState('admin'); // или реальный ID админа
const rateLimit = useRateLimit(adminId, ActionType.FORM_SUBMISSION);
const titleSpam = useSpamDetection(`${adminId}-announcement-title`);
const contentSpam = useSpamDetection(`${adminId}-announcement-content`);
```

### Обработчик
```typescript
const handleCreateAnnouncement = async () => {
  if (!rateLimit.checkLimit()) {
    toast.error('Слишком много попыток создания объявлений');
    return;
  }

  // Spam check title
  const titleCheck = titleSpam.checkContent(announcementData.title);
  if (titleCheck.isSpam) {
    toast.error(`Спам в заголовке: ${titleCheck.reason}`);
    rateLimit.recordAttempt(false);
    return;
  }

  // Spam check content
  const contentCheck = contentSpam.checkContent(announcementData.content);
  if (contentCheck.isSpam) {
    toast.error(`Спам в тексте: ${contentCheck.reason}`);
    rateLimit.recordAttempt(false);
    return;
  }

  try {
    // Ваша логика создания объявления
    // ... ваш код ...
    
    rateLimit.recordAttempt(true);
    toast.success('Объявление создано');
  } catch (error) {
    rateLimit.recordAttempt(false);
    toast.error('Ошибка создания объявления');
  }
};
```

### Добавить вкладку "Безопасность"
```tsx
{/* В TabsList */}
<TabsTrigger value="security">
  <Shield className="w-4 h-4 mr-2" />
  Безопасность
</TabsTrigger>

{/* В TabsContent */}
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
```

### Индикаторы в форме объявлений
```tsx
<RateLimitIndicator
  remainingAttempts={rateLimit.remainingAttempts}
  maxAttempts={20}
  isLocked={rateLimit.isLocked}
/>

{/* Для заголовка */}
{titleSpam.isSpam && (
  <SpamProtection
    isSpam={true}
    confidence={titleSpam.confidence}
    reason={titleSpam.reason}
  />
)}

{/* Для контента */}
{contentSpam.isSpam && (
  <SpamProtection
    isSpam={true}
    confidence={contentSpam.confidence}
    reason={contentSpam.reason}
  />
)}
```

---

## 6. Использование ProtectedForm (САМЫЙ ПРОСТОЙ СПОСОБ)

### Для любой формы
```tsx
import { ProtectedForm } from './components/ProtectedForm';
import { ActionType } from '../utils/antiSpam';

// Замените вашу форму на:
<ProtectedForm
  identifier={user.phone}
  actionType={ActionType.FORM_SUBMISSION}
  onSubmit={async (formData) => {
    // Ваша логика отправки
    console.log('Submit:', formData);
  }}
  submitButtonText="Отправить"
  checkSpam={true}
  spamCheckFields={['message', 'description', 'comment']}
  showSecurityIndicators={true}
>
  {({ formData, updateFormData, isSubmitting }) => (
    <div className="space-y-4">
      <Input
        value={formData.message || ''}
        onChange={(e) => updateFormData('message', e.target.value)}
        disabled={isSubmitting}
        placeholder="Сообщение"
      />
      
      <Textarea
        value={formData.description || ''}
        onChange={(e) => updateFormData('description', e.target.value)}
        disabled={isSubmitting}
        placeholder="Описание"
      />
    </div>
  )}
</ProtectedForm>
```

---

## 📋 Чек-лист интеграции

Для каждой страницы:

```markdown
- [ ] Добавлены импорты
- [ ] Добавлены хуки (useRateLimit, useSpamDetection)
- [ ] Обновлён обработчик отправки
- [ ] Добавлены индикаторы в JSX
- [ ] Добавлен disabled на кнопку
- [ ] Протестирована блокировка
- [ ] Протестирована разблокировка
```

---

## 🧪 Тестирование

### Тест Rate Limiting
```bash
# 1. Попробуйте отправить форму 6 раз подряд
# 2. На 6-й раз должна появиться блокировка
# 3. Подождите указанное время или сбросьте:
```

```javascript
// В консоли браузера:
import { rateLimiter, ActionType } from './utils/antiSpam';
rateLimiter.reset(userPhone, ActionType.FORM_SUBMISSION);
```

### Тест Spam Detection
```bash
# Введите в поле текст со спамом:
"http://spam.com http://spam2.com http://spam3.com http://spam4.com"

# Должно появиться предупреждение о спаме
```

---

## 🔧 Отладка

### Проверить статус лимита
```javascript
// В консоли браузера:
const stats = rateLimiter.getStats(userPhone, ActionType.FORM_SUBMISSION);
console.log('Rate Limit Stats:', stats);
```

### Проверить события безопасности
```javascript
const events = JSON.parse(localStorage.getItem('security_events') || '[]');
console.table(events);
```

### Сбросить все лимиты
```javascript
import { rateLimiter } from './utils/antiSpam';
rateLimiter.cleanup();
localStorage.clear();
```

---

## ⚙️ Настройка лимитов (опционально)

Откройте `/utils/antiSpam.ts` и измените:

```typescript
const RATE_LIMIT_CONFIGS: Record<ActionType, RateLimitConfig> = {
  [ActionType.METER_SUBMISSION]: {
    maxAttempts: 10,          // Было: 5
    windowMs: 60 * 60 * 1000, // 1 час
  },
  
  [ActionType.REQUEST_SUBMISSION]: {
    maxAttempts: 20,           // Было: 10
    windowMs: 24 * 60 * 60 * 1000,
  },
  
  // ... другие настройки ...
};
```

---

## 🎉 Готово!

После применения всех команд ваше приложение будет иметь:

✅ Rate Limiting на всех формах  
✅ Spam Detection на критичных полях  
✅ Визуальные индикаторы  
✅ Панель мониторинга для админов  
✅ Логирование всех событий  

**Время интеграции:** 10-15 минут на форму  
**Сложность:** Низкая (копируй-вставляй)

---

**Версия:** 1.0.0  
**Дата:** 30 ноября 2025  
**Статус:** ✅ Готово к использованию
