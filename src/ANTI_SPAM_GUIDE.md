# 🛡️ Руководство по защите от спама и Rate Limiting

Комплексная система защиты приложения от спама, ботов и злоупотреблений.

---

## 📋 Содержание

- [Обзор системы](#обзор-системы)
- [Rate Limiting](#rate-limiting)
- [Защита от спама](#защита-от-спама)
- [CAPTCHA](#captcha)
- [Honeypot](#honeypot)
- [IP Rate Limiting](#ip-rate-limiting)
- [Использование](#использование)
- [Настройка](#настройка)
- [Мониторинг](#мониторинг)

---

## 🎯 Обзор системы

Система защиты состоит из 6 уровней:

| Уровень | Защита | Тип | Скрытность |
|---------|--------|-----|------------|
| 1 | **IP Rate Limiting** | 60 запросов/мин | Прозрачная |
| 2 | **Action Rate Limiting** | Индивидуально | Прозрачная |
| 3 | **Honeypot** | Ловушка для ботов | Скрытая |
| 4 | **Spam Detection** | Анализ контента | Автоматическая |
| 5 | **CAPTCHA** | После N попыток | Интерактивная |
| 6 | **Debounce/Throttle** | Защита от спама кликов | Прозрачная |

---

## ⏱️ Rate Limiting

### Типы действий и лимиты

```typescript
enum ActionType {
  LOGIN = 'login',                    // 5 попыток / 15 мин
  REGISTRATION = 'registration',       // 3 попытки / час
  PASSWORD_RESET = 'password_reset',   // 3 попытки / час
  METER_SUBMISSION = 'meter_submission', // 5 попыток / час
  REQUEST_SUBMISSION = 'request_submission', // 10 попыток / день
  PAYMENT = 'payment',                 // 5 попыток / час
  ADMIN_LOGIN = 'admin_login',         // 3 попытки / 15 мин
  FORM_SUBMISSION = 'form_submission', // 20 попыток / мин
  API_CALL = 'api_call'               // 60 попыток / мин
}
```

### Использование

```typescript
import { rateLimiter, ActionType } from '../utils/antiSpam';

// Проверить лимит
const rateLimit = rateLimiter.checkLimit(identifier, ActionType.LOGIN);
if (!rateLimit.allowed) {
  toast.error(rateLimit.message);
  return;
}

// Записать попытку (success = true сбрасывает счетчик)
rateLimiter.recordAttempt(identifier, ActionType.LOGIN, false);

// Получить статистику
const stats = rateLimiter.getStats(identifier, ActionType.LOGIN);
console.log(`Попыток: ${stats.totalAttempts}, Осталось: ${stats.remainingAttempts}`);

// Сбросить счетчик
rateLimiter.reset(identifier, ActionType.LOGIN);
```

### Настройка лимитов

Файл: `/utils/antiSpam.ts`

```typescript
const RATE_LIMIT_CONFIGS: Record<ActionType, RateLimitConfig> = {
  [ActionType.LOGIN]: {
    maxAttempts: 5,                  // Изменить количество попыток
    windowMs: 15 * 60 * 1000,        // Изменить временное окно
    lockoutMs: 30 * 60 * 1000        // Изменить время блокировки
  },
  // ...
};
```

---

## 🚫 Защита от спама

### Детекция спама

Система автоматически проверяет контент на:

1. ✅ **Слишком много URL** (>3 ссылок)
2. ✅ **Повторяющиеся символы** (aaaaaa, !!!!!!)
3. ✅ **Много заглавных букв** (>70% CAPS)
4. ✅ **Спецсимволы** (>30% !@#$%...)
5. ✅ **Длина сообщения** (<3 или >5000 символов)
6. ✅ **Дубликаты** (повторная отправка)
7. ✅ **Спам-ключевые слова**

### Использование

```typescript
import { spamDetector } from '../utils/antiSpam';

const spamCheck = spamDetector.isSpam(content, userId);

if (spamCheck.isSpam) {
  console.warn('Spam detected:', spamCheck.reason);
  toast.error('Обнаружена подозрительная активность');
  return;
}

// Уровень уверенности
console.log(`Spam confidence: ${spamCheck.confidence}%`);
```

### Пример срабатывания

```typescript
// ❌ Будет заблокировано
"КУПИ ВИАГРУ!!! https://spam.com https://spam2.com https://spam3.com https://spam4.com"

// ❌ Будет заблокировано
"aaaaaaaaaaaaaaaaaaaaaaaa"

// ❌ Будет заблокировано  
"!@#$%^&*()!@#$%^&*()!@#$%^&*()"

// ✅ Пропустит
"Добрый день, у меня не работает горячая вода с 10 утра"
```

---

## 🤖 CAPTCHA

### Когда появляется CAPTCHA?

- **Пользователь**: После 3 неудачных попыток входа
- **Администратор**: После 2 неудачных попыток входа

### Типы CAPTCHA

#### Simple Math CAPTCHA (текущая)
```
7 + 3 = ?
```

**Преимущества:**
- ✅ Простота для пользователей
- ✅ Не требует внешних сервисов
- ✅ Работает offline

**Недостатки:**
- ⚠️ Простые боты могут решить
- ⚠️ Не для высокой нагрузки

### Использование

```tsx
import { Captcha } from './ui/captcha';

function MyForm() {
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [attempts, setAttempts] = useState(0);

  return (
    <form>
      {/* Показать после N попыток */}
      {attempts >= 3 && (
        <Captcha 
          onVerify={setCaptchaVerified}
          required={true}
        />
      )}
      
      <button disabled={attempts >= 3 && !captchaVerified}>
        Отправить
      </button>
    </form>
  );
}
```

### Улучшение (для production)

```bash
# Установить Google reCAPTCHA
npm install react-google-recaptcha

# Или hCaptcha
npm install @hcaptcha/react-hcaptcha
```

```tsx
import ReCAPTCHA from "react-google-recaptcha";

<ReCAPTCHA
  sitekey="YOUR_SITE_KEY"
  onChange={onChange}
/>
```

---

## 🍯 Honeypot

### Принцип работы

Honeypot - это скрытое поле, которое:
- ❌ Невидимо для пользователей (CSS: position: absolute, left: -9999px)
- ✅ Видимо для ботов
- 🤖 Боты заполняют все поля → попадаются

### Использование

```tsx
import { Honeypot, createHoneypot } from './ui/captcha';

const honeypot = createHoneypot();

function MyForm() {
  const [honeypotValue, setHoneypotValue] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Проверка honeypot
    if (honeypot.isBot(honeypotValue)) {
      console.warn('Bot detected!');
      return; // Silent fail
    }
    
    // Продолжить обработку...
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Honeypot 
        name={honeypot.fieldName}
        value={honeypotValue}
        onChange={setHoneypotValue}
      />
      {/* Остальные поля */}
    </form>
  );
}
```

### Важно!

- ✅ Всегда используйте **silent fail** (не показывайте ошибку боту)
- ✅ Генерируйте **случайное имя поля** при каждой загрузке
- ❌ Не называйте поле "honeypot" или "bot_trap"

---

## 🌐 IP Rate Limiting

### Защита от DDoS

Ограничение запросов с одного IP:

```typescript
import { ipLimiter } from '../utils/antiSpam';

// Проверить IP
const ipCheck = ipLimiter.checkIP();
if (!ipCheck.allowed) {
  toast.error(ipCheck.message);
  return;
}

// Записать запрос
ipLimiter.recordRequest();
```

### Лимиты

- **60 запросов в минуту** с одного IP (pseudo-IP)
- Превышение → блокировка на 1 минуту

### Pseudo-IP в браузере

Т.к. нет backend, используется browser fingerprint:

```typescript
// Генерируется один раз и сохраняется
const fingerprint = localStorage.getItem('browser_fingerprint');
```

⚠️ **Для production**: Используйте реальный IP на сервере!

---

## 📊 Мониторинг и логирование

### Все события логируются

```typescript
console.warn('[SECURITY] Suspicious activity detected:', {
  action: 'login',
  identifier: '+7999...',
  attempts: 5
});
```

### Получить статистику

```typescript
// Rate Limiter статистика
const stats = rateLimiter.getStats(identifier, ActionType.LOGIN);
console.log(stats);
// {
//   totalAttempts: 3,
//   remainingAttempts: 2,
//   firstAttempt: Date,
//   lastAttempt: Date,
//   isLocked: false
// }
```

### Security Events (для интеграции с backend)

```typescript
// Примеры событий
'login_attempt'
'login_failed'
'login_success'
'rate_limit_exceeded'
'spam_detected'
'bot_detected_honeypot'
'captcha_failed'
'captcha_success'
```

---

## 🎯 Примеры использования

### Форма входа

```tsx
import { rateLimiter, ipLimiter, ActionType } from '../utils/antiSpam';
import { Captcha, Honeypot } from './ui/captcha';

function LoginForm() {
  const [attempts, setAttempts] = useState(0);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [honeypotValue, setHoneypotValue] = useState('');
  const honeypot = createHoneypot();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Check honeypot
    if (honeypot.isBot(honeypotValue)) {
      return; // Silent fail
    }
    
    // 2. Check IP rate limit
    const ipCheck = ipLimiter.checkIP();
    if (!ipCheck.allowed) {
      toast.error(ipCheck.message);
      return;
    }
    ipLimiter.recordRequest();
    
    // 3. Check action rate limit
    const rateLimit = rateLimiter.checkLimit(phone, ActionType.LOGIN);
    if (!rateLimit.allowed) {
      toast.error(rateLimit.message);
      return;
    }
    
    // 4. Check CAPTCHA if needed
    if (attempts >= 3 && !captchaVerified) {
      toast.error('Пройдите проверку безопасности');
      return;
    }
    
    // 5. Validate credentials
    const isValid = await validateLogin(phone, pin);
    
    if (isValid) {
      rateLimiter.recordAttempt(phone, ActionType.LOGIN, true);
      setAttempts(0);
      // Success!
    } else {
      rateLimiter.recordAttempt(phone, ActionType.LOGIN, false);
      setAttempts(prev => prev + 1);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="tel" {...} />
      <input type="password" {...} />
      
      <Honeypot name={honeypot.fieldName} value={honeypotValue} onChange={setHoneypotValue} />
      
      {attempts >= 3 && (
        <Captcha onVerify={setCaptchaVerified} required />
      )}
      
      <button type="submit">Войти</button>
    </form>
  );
}
```

### Форма подачи заявки

```tsx
import { rateLimiter, spamDetector, ActionType } from '../utils/antiSpam';

function RequestForm() {
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check rate limit (10 заявок в день)
    const rateLimit = rateLimiter.checkLimit(userId, ActionType.REQUEST_SUBMISSION);
    if (!rateLimit.allowed) {
      toast.error('Превышен лимит заявок на сегодня');
      return;
    }
    
    // Check spam in description
    const spamCheck = spamDetector.isSpam(description, userId);
    if (spamCheck.isSpam) {
      toast.error('Обнаружена подозрительная активность');
      console.warn('Spam:', spamCheck.reason, spamCheck.confidence);
      return;
    }
    
    // Submit request
    await submitRequest(data);
    rateLimiter.recordAttempt(userId, ActionType.REQUEST_SUBMISSION, true);
  };
  
  // ...
}
```

### Debounce для кнопок

```tsx
import { debounce } from '../utils/antiSpam';

function MyComponent() {
  // Debounce на 1 секунду
  const debouncedSubmit = useMemo(
    () => debounce(handleSubmit, 1000),
    []
  );
  
  return (
    <button onClick={debouncedSubmit}>
      Отправить
    </button>
  );
}
```

### Throttle для скролла

```tsx
import { throttle } from '../utils/antiSpam';

function InfiniteScroll() {
  useEffect(() => {
    const handleScroll = throttle(() => {
      // Load more data
    }, 200); // Max раз в 200ms
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // ...
}
```

---

## ⚙️ Настройка

### Изменить лимиты

Файл: `/utils/antiSpam.ts`

```typescript
// Увеличить лимит попыток входа
[ActionType.LOGIN]: {
  maxAttempts: 10,  // Было: 5
  windowMs: 30 * 60 * 1000,  // Было: 15 минут
  lockoutMs: 60 * 60 * 1000  // Было: 30 минут
}
```

### Добавить новый тип действия

```typescript
// 1. Добавить в enum
enum ActionType {
  // ...existing
  COMMENT_POST = 'comment_post'
}

// 2. Добавить конфигурацию
const RATE_LIMIT_CONFIGS = {
  // ...existing
  [ActionType.COMMENT_POST]: {
    maxAttempts: 20,
    windowMs: 60 * 60 * 1000
  }
};

// 3. Использовать
rateLimiter.checkLimit(userId, ActionType.COMMENT_POST);
```

### Изменить спам-ключевые слова

```typescript
// В SpamDetector.isSpam()
const spamKeywords = [
  'виагра', 'казино', 
  // Добавить свои:
  'криптовалюта', 'mlm', 'форекс'
];
```

---

## 🧪 Тестирование

### Тест Rate Limiting

```typescript
// Попробуйте войти 6 раз с неверным паролем
for (let i = 0; i < 6; i++) {
  await login('wrong_password');
}
// Должна появиться блокировка
```

### Тест Honeypot

```typescript
// Вручную установите значение honeypot
honeypotValue = 'bot_filled_this';
// Submit должен провалиться silently
```

### Тест Spam Detection

```typescript
const spamText = "КУПИ СЕЙЧАС!!! http://spam1.com http://spam2.com http://spam3.com http://spam4.com";
const result = spamDetector.isSpam(spamText, 'user123');
console.log(result.isSpam); // true
console.log(result.confidence); // >90
```

### Тест CAPTCHA

```typescript
// После 3 неудачных попыток CAPTCHA должна появиться
setLoginAttempts(3);
// Проверьте что кнопка disabled без решения CAPTCHA
```

---

## 📈 Производительность

### Очистка старых записей

Автоматически выполняется каждый час:

```typescript
// Запускается автоматически
cleanupRateLimiters();
```

Вручную:

```typescript
rateLimiter.cleanup();
```

### Хранилище

- **Rate Limiter**: Map в памяти (~1KB на пользователя)
- **Spam Detector**: Хранит последние 10 сообщений (~10KB)
- **IP Limiter**: Хранит timestamps за последнюю минуту (~5KB)

**Итого**: ~16KB на активного пользователя

---

## 🚀 Production чеклист

### Обязательно:

- [ ] ✅ Переместить все лимиты в environment variables
- [ ] ✅ Реализовать backend API
- [ ] ✅ Использовать реальный IP вместо fingerprint
- [ ] ✅ Интегрировать Google reCAPTCHA v3
- [ ] ✅ Добавить логирование на сервер
- [ ] ✅ Настроить алерты для подозрительной активности
- [ ] ✅ Добавить WAF (Web Application Firewall)
- [ ] ✅ Регулярный security audit

### Рекомендуется:

- [ ] ⭕ Redis для хранения rate limit счетчиков
- [ ] ⭕ Cloudflare для DDoS защиты
- [ ] ⭕ Device fingerprinting (FingerprintJS Pro)
- [ ] ⭕ Sentry для мониторинга ошибок
- [ ] ⭕ DataDog для метрик

---

## 🆘 Troubleshooting

### Пользователь заблокирован по ошибке

```typescript
// Сбросить вручную
rateLimiter.reset(userIdentifier, ActionType.LOGIN);
```

### Honeypot срабатывает на реальных пользователях

Проверьте:
- Поле действительно скрыто (CSS)
- Autocomplete отключен
- TabIndex = -1

### CAPTCHA не появляется

Проверьте:
- `loginAttempts` увеличивается?
- Условие правильное (`>= 3`)?
- CAPTCHA компонент импортирован?

---

## 📚 Дополнительные ресурсы

- [OWASP Rate Limiting](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html)
- [Google reCAPTCHA](https://www.google.com/recaptcha/about/)
- [Cloudflare Bot Management](https://www.cloudflare.com/products/bot-management/)
- [OWASP Anti-Automation](https://owasp.org/www-community/controls/Blocking_Brute_Force_Attacks)

---

<div align="center">

**Защита активирована! 🛡️**

Проект защищен от спама, ботов и злоупотреблений.

</div>
