# 🛡️ Руководство по защите от спама и Rate Limiting

## 📋 Содержание

1. [Обзор системы защиты](#обзор-системы-защиты)
2. [Компоненты](#компоненты)
3. [Хуки](#хуки)
4. [Примеры использования](#примеры-использования)
5. [Настройка лимитов](#настройка-лимитов)
6. [Мониторинг](#мониторинг)

---

## 🎯 Обзор системы защиты

### 6-уровневая защита от спама

1. **URL фильтр** - Блокировка сообщений с множественными ссылками
2. **Паттерн анализ** - Обнаружение повторяющихся символов (aaaa, !!!!)
3. **Проверка спецсимволов** - Контроль количества специальных символов
4. **Дубликаты** - Проверка истории отправленных сообщений
5. **Спам-ключевые слова** - Фильтрация по словарю
6. **Honeypot** - Скрытое поле для ловли ботов

### Rate Limiting

| Действие | Лимит | Окно | Блокировка |
|----------|-------|------|------------|
| **Вход** | 5 попыток | 15 минут | 30 минут |
| **Регистрация** | 3 попытки | 1 час | 2 часа |
| **Сброс пароля** | 3 попытки | 1 час | 1 час |
| **Показания счётчиков** | 5 отправок | 1 час | - |
| **Заявки на ремонт** | 10 заявок | 24 часа | - |
| **Оплата** | 5 попыток | 1 час | 2 часа |
| **Админ-вход** | 5 попыток | 15 минут | 30 минут |

---

## 🧩 Компоненты

### 1. RateLimitIndicator

Визуальный индикатор лимита попыток.

```tsx
import { RateLimitIndicator } from './components/RateLimitIndicator';

<RateLimitIndicator
  remainingAttempts={3}
  maxAttempts={5}
  lockoutTime={1800} // секунды
  isLocked={false}
  actionType="входа"
/>
```

**Визуальные состояния:**
- 🟢 80-100% попыток - не показывается
- 🔵 60-80% - синий индикатор
- 🟡 40-60% - жёлтый с предупреждением
- 🔴 0-40% - красный с серьёзным предупреждением
- 🚫 Заблокировано - красный с таймером разблокировки

---

### 2. SpamProtection

Индикатор обнаружения спама.

```tsx
import { SpamProtection } from './components/SpamProtection';

<SpamProtection
  isSpam={true}
  confidence={85}
  reason="Обнаружены спам-ключевые слова"
  showDetails={true}
/>
```

---

### 3. SecurityDashboard

Панель мониторинга безопасности.

```tsx
import { SecurityDashboard } from './components/SecurityDashboard';

// В админ-панели
<SecurityDashboard />
```

**Показывает:**
- Общую статистику попыток
- Количество заблокированных попыток
- Активные блокировки
- Недавние события безопасности
- Статус защиты от спама

---

### 4. ProtectedForm

HOC для защиты форм.

```tsx
import { ProtectedForm } from './components/ProtectedForm';
import { ActionType } from '../utils/antiSpam';

<ProtectedForm
  identifier={user.phone} // Уникальный ID пользователя
  actionType={ActionType.METER_SUBMISSION}
  onSubmit={handleSubmit}
  submitButtonText="Отправить показания"
  checkSpam={true}
  spamCheckFields={['meterValue', 'notes']}
  showSecurityIndicators={true}
>
  {({ formData, updateFormData, isSubmitting }) => (
    <>
      <Input
        value={formData.meterValue || ''}
        onChange={(e) => updateFormData('meterValue', e.target.value)}
        disabled={isSubmitting}
      />
    </>
  )}
</ProtectedForm>
```

---

## 🪝 Хуки

### useRateLimit

Управление rate limiting для конкретного действия.

```tsx
import { useRateLimit } from '../hooks/useRateLimit';
import { ActionType } from '../utils/antiSpam';

function LoginForm() {
  const rateLimit = useRateLimit(
    userPhone, // identifier
    ActionType.LOGIN
  );

  const handleLogin = async () => {
    // Проверка лимита
    if (!rateLimit.checkLimit()) {
      toast.error(rateLimit.message);
      return;
    }

    try {
      await login();
      rateLimit.recordAttempt(true); // Успех
    } catch (error) {
      rateLimit.recordAttempt(false); // Неудача
    }
  };

  return (
    <div>
      <RateLimitIndicator
        remainingAttempts={rateLimit.remainingAttempts}
        maxAttempts={5}
        isLocked={rateLimit.isLocked}
        lockoutTime={rateLimit.lockoutTime}
      />
      
      <Button 
        onClick={handleLogin}
        disabled={rateLimit.isLocked || !rateLimit.allowed}
      >
        Войти
      </Button>
    </div>
  );
}
```

---

### useSpamDetection

Обнаружение спама в контенте.

```tsx
import { useSpamDetection } from '../hooks/useSpamDetection';

function MessageForm({ userId }) {
  const spam = useSpamDetection(userId);
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    const result = spam.checkContent(message);
    
    if (result.isSpam) {
      toast.error(`Спам обнаружен: ${result.reason}`);
      return;
    }

    // Отправить сообщение
  };

  return (
    <div>
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      
      {spam.isSpam && (
        <SpamProtection
          isSpam={spam.isSpam}
          confidence={spam.confidence}
          reason={spam.reason}
        />
      )}
      
      <Button onClick={handleSubmit}>Отправить</Button>
    </div>
  );
}
```

---

### useFormSpamProtection

Комплексная защита формы.

```tsx
import { useFormSpamProtection } from '../hooks/useSpamDetection';

function RequestForm({ userId }) {
  const protection = useFormSpamProtection(userId);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  const handleSubmit = () => {
    const validation = protection.validateFormData(formData);
    
    if (!validation.isValid) {
      // Показать ошибки
      Object.entries(validation.errors).forEach(([field, error]) => {
        toast.error(`${field}: ${error}`);
      });
      return;
    }

    // Отправить форму
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Поля формы */}
      </form>

      {/* Монитор защиты */}
      <AntiSpamMonitor
        totalBlocked={protection.blockedCount}
        recentAttempts={protection.recentAttempts}
        lastBlockedTime={protection.lastBlockedTime}
      />
    </div>
  );
}
```

---

## 📝 Примеры использования

### Пример 1: Защита формы входа

```tsx
import { useState } from 'react';
import { useRateLimit } from '../hooks/useRateLimit';
import { ActionType } from '../utils/antiSpam';
import { RateLimitIndicator } from './RateLimitIndicator';

function LoginForm() {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const rateLimit = useRateLimit(phone, ActionType.LOGIN);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Прове��ка лимита
    if (!rateLimit.allowed) {
      return;
    }

    try {
      const result = await authenticateUser(phone, pin);
      
      if (result.success) {
        rateLimit.recordAttempt(true); // Сбросить счётчик
        toast.success('Вход выполнен');
      } else {
        rateLimit.recordAttempt(false); // Увеличить счётчик
        toast.error('Неверные данные');
      }
    } catch (error) {
      rateLimit.recordAttempt(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <RateLimitIndicator
        remainingAttempts={rateLimit.remainingAttempts}
        maxAttempts={5}
        isLocked={rateLimit.isLocked}
        lockoutTime={rateLimit.lockoutTime}
        actionType="входа"
      />

      <Input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Телефон"
        disabled={rateLimit.isLocked}
      />

      <Input
        type="password"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        placeholder="PIN"
        disabled={rateLimit.isLocked}
      />

      <Button 
        type="submit"
        disabled={rateLimit.isLocked || !rateLimit.allowed}
      >
        Войти
      </Button>
    </form>
  );
}
```

---

### Пример 2: Защита формы объявлений

```tsx
import { useState } from 'react';
import { useRateLimit } from '../hooks/useRateLimit';
import { useSpamDetection } from '../hooks/useSpamDetection';
import { ActionType } from '../utils/antiSpam';

function AnnouncementForm({ adminId }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  const rateLimit = useRateLimit(adminId, ActionType.FORM_SUBMISSION);
  const titleSpam = useSpamDetection(`${adminId}-title`);
  const contentSpam = useSpamDetection(`${adminId}-content`);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Rate limit check
    if (!rateLimit.checkLimit()) {
      toast.error('Слишком много попыток');
      return;
    }

    // Spam check
    const titleCheck = titleSpam.checkContent(title);
    const contentCheck = contentSpam.checkContent(content);

    if (titleCheck.isSpam) {
      toast.error(`Спам в заголовке: ${titleCheck.reason}`);
      rateLimit.recordAttempt(false);
      return;
    }

    if (contentCheck.isSpam) {
      toast.error(`Спам в тексте: ${contentCheck.reason}`);
      rateLimit.recordAttempt(false);
      return;
    }

    try {
      await createAnnouncement({ title, content });
      rateLimit.recordAttempt(true);
      toast.success('Объявление создано');
    } catch (error) {
      rateLimit.recordAttempt(false);
      toast.error('Ошибка создания');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Заголовок"
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
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Текст объявления"
          />
          {contentSpam.isSpam && (
            <SpamProtection
              isSpam={true}
              confidence={contentSpam.confidence}
              reason={contentSpam.reason}
            />
          )}
        </div>

        <RateLimitIndicator
          remainingAttempts={rateLimit.remainingAttempts}
          maxAttempts={20}
          isLocked={rateLimit.isLocked}
        />

        <Button 
          type="submit"
          disabled={
            rateLimit.isLocked || 
            titleSpam.isSpam || 
            contentSpam.isSpam
          }
        >
          Опубликовать
        </Button>
      </div>
    </form>
  );
}
```

---

### Пример 3: Использование ProtectedForm

```tsx
import { ProtectedForm } from './ProtectedForm';
import { ActionType } from '../utils/antiSpam';

function MeterSubmissionForm({ user }) {
  const handleSubmit = async (formData: any) => {
    // Отправить показания
    await submitMeterReading({
      userId: user.id,
      value: formData.meterValue,
      notes: formData.notes
    });
  };

  return (
    <ProtectedForm
      identifier={user.phone}
      actionType={ActionType.METER_SUBMISSION}
      onSubmit={handleSubmit}
      submitButtonText="Отправить показания"
      checkSpam={true}
      spamCheckFields={['notes']}
      showSecurityIndicators={true}
    >
      {({ formData, updateFormData, isSubmitting }) => (
        <div className="space-y-4">
          <div>
            <Label>Показания счётчика</Label>
            <Input
              type="number"
              value={formData.meterValue || ''}
              onChange={(e) => updateFormData('meterValue', e.target.value)}
              disabled={isSubmitting}
              placeholder="Введите показания"
            />
          </div>

          <div>
            <Label>Примечания (опционально)</Label>
            <Textarea
              value={formData.notes || ''}
              onChange={(e) => updateFormData('notes', e.target.value)}
              disabled={isSubmitting}
              placeholder="Дополнительная информация"
            />
          </div>
        </div>
      )}
    </ProtectedForm>
  );
}
```

---

## ⚙️ Настройка лимитов

Лимиты настраиваются в `/utils/antiSpam.ts`:

```typescript
const RATE_LIMIT_CONFIGS: Record<ActionType, RateLimitConfig> = {
  [ActionType.LOGIN]: {
    maxAttempts: 5,           // Максимум попыток
    windowMs: 15 * 60 * 1000, // Окно в миллисекундах
    lockoutMs: 30 * 60 * 1000 // Время блокировки
  },
  // ... другие типы действий
};
```

### Изменение лимитов

```typescript
// Увеличить лимит входов для разработки
[ActionType.LOGIN]: {
  maxAttempts: 10,          // Было: 5
  windowMs: 15 * 60 * 1000,
  lockoutMs: 15 * 60 * 1000 // Было: 30 минут
}
```

---

## 📊 Мониторинг

### В админ-панели

```tsx
import { SecurityDashboard } from './components/SecurityDashboard';

function AdminPanel() {
  return (
    <Tabs>
      <TabsList>
        <TabsTrigger value="security">
          <Shield className="w-4 h-4 mr-2" />
          Безопасность
        </TabsTrigger>
      </TabsList>

      <TabsContent value="security">
        <SecurityDashboard />
      </TabsContent>
    </Tabs>
  );
}
```

### Просмотр логов

```typescript
// Получить все события безопасности
const events = JSON.parse(
  localStorage.getItem('security_events') || '[]'
);

// Фильтр по типу
const failedLogins = events.filter(
  e => e.type === 'failed_login'
);

// За последний час
const recentEvents = events.filter(
  e => e.timestamp > Date.now() - 60 * 60 * 1000
);
```

---

## 🔧 Утилиты

### Очистка старых записей

```typescript
import { rateLimiter } from '../utils/antiSpam';

// Очистить записи старше 24 часов
rateLimiter.cleanup();
```

### Сброс лимита для пользователя

```typescript
import { rateLimiter, ActionType } from '../utils/antiSpam';

// Сбросить лимит входа
rateLimiter.reset(userPhone, ActionType.LOGIN);
```

### Получение статистики

```typescript
const stats = rateLimiter.getStats(userPhone, ActionType.LOGIN);

console.log({
  totalAttempts: stats.totalAttempts,
  remainingAttempts: stats.remainingAttempts,
  isLocked: stats.isLocked,
  firstAttempt: stats.firstAttempt,
  lastAttempt: stats.lastAttempt
});
```

---

## 🎨 Кастомизация

### Изменение цветов индикатора

```tsx
<RateLimitIndicator
  // ... props
  className="custom-class"
/>

// В CSS
.custom-class {
  /* Ваши стили */
}
```

### Создание собственного индикатора

```tsx
function CustomRateLimitIndicator({ remainingAttempts, maxAttempts }) {
  const percentage = (remainingAttempts / maxAttempts) * 100;
  
  return (
    <div className="flex items-center gap-2">
      <Progress value={percentage} />
      <span>{remainingAttempts} / {maxAttempts}</span>
    </div>
  );
}
```

---

## 🚀 Best Practices

### 1. Всегда проверяйте rate limit перед действием

```tsx
✅ ПРАВИЛЬНО:
if (!rateLimit.checkLimit()) {
  return;
}

❌ НЕПРАВИЛЬНО:
// Проверка после действия
```

### 2. Записывайте успешные попытки

```tsx
✅ ПРАВИЛЬНО:
if (success) {
  rateLimit.recordAttempt(true); // Сбросит счётчик
}

❌ НЕПРАВИЛЬНО:
// Не записывать успех = счётчик не сбросится
```

### 3. Показывайте индикатор заранее

```tsx
✅ ПРАВИЛЬНО:
// Показывать при 2+ неудачных попытках
{loginAttempts >= 2 && <RateLimitIndicator />}

❌ НЕПРАВИЛЬНО:
// Показывать только при блокировке
{isLocked && <RateLimitIndicator />}
```

### 4. Проверяйте спам в реальном времени

```tsx
✅ ПРАВИЛЬНО:
const handleChange = (value: string) => {
  setValue(value);
  spam.checkContent(value); // Проверка сразу
};

❌ НЕПРАВИЛЬНО:
// Проверка только при submit
```

### 5. Используйте debounce для проверок

```tsx
import { debounce } from '../utils/antiSpam';

const debouncedSpamCheck = debounce((value: string) => {
  spam.checkContent(value);
}, 500);
```

---

## 📞 Troubleshooting

### Проблема: Блокировка не снимается

**Решение:**
```typescript
// Проверить время блокировки
const stats = rateLimiter.getStats(identifier, actionType);
console.log('Locked until:', new Date(stats.lastAttempt + lockoutMs));

// Принудительно сбросить
rateLimiter.reset(identifier, actionType);
```

### Проблема: Ложные срабатывания спам-фильтра

**Решение:**
```typescript
// Очистить историю пользователя
spamDetector.clearHistory(userId);

// Или настроить более мягкие параметры в antiSpam.ts
```

### Проблема: Счётчик не обновляется

**Решение:**
```typescript
// Убедиться что используется один identifier
const rateLimit = useRateLimit(userId, ActionType.LOGIN);
//                              ^^^^^^ Должен быть одинаковым
```

---

## 📚 API Reference

### ActionType

```typescript
enum ActionType {
  LOGIN = 'login',
  REGISTRATION = 'registration',
  PASSWORD_RESET = 'password_reset',
  METER_SUBMISSION = 'meter_submission',
  REQUEST_SUBMISSION = 'request_submission',
  PAYMENT = 'payment',
  ADMIN_LOGIN = 'admin_login',
  FORM_SUBMISSION = 'form_submission',
  API_CALL = 'api_call'
}
```

### RateLimiter Methods

```typescript
// Проверить лимит
checkLimit(identifier: string, action: ActionType): {
  allowed: boolean;
  remainingAttempts: number;
  resetTime?: number;
  lockoutTime?: number;
  message?: string;
}

// Записать попытку
recordAttempt(identifier: string, action: ActionType, success?: boolean): void

// Сбросить счётчик
reset(identifier: string, action: ActionType): void

// Получить статистику
getStats(identifier: string, action: ActionType): {
  totalAttempts: number;
  remainingAttempts: number;
  firstAttempt?: Date;
  lastAttempt?: Date;
  isLocked: boolean;
}

// Очистить старые записи
cleanup(): void
```

### SpamDetector Methods

```typescript
// Проверить на спам
isSpam(content: string, identifier: string): {
  isSpam: boolean;
  reason?: string;
  confidence: number;
}

// Очистить историю
clearHistory(identifier: string): void
```

---

**Версия:** 1.0.0  
**Последнее обновление:** 30 ноября 2025  
**Автор:** Security Team
