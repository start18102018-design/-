# ⚡ Быстрые исправления безопасности

Критичные уязвимости, которые можно исправить за 1-2 часа.

---

## 🔴 Критично: Исправить немедленно!

### 1. Удалить hardcoded пароль админа

**Файл:** `/utils/adminConfig.ts`

**Было:**
```typescript
export const DEV_ADMIN_PASSWORD = "admin123";
```

**Стало:**
```typescript
// УДАЛИТЬ ЭТУ СТРОКУ ПОЛНОСТЬЮ!
// Использовать только через environment variables
```

**Команды:**
```bash
# Откройте файл
nano /utils/adminConfig.ts

# Удалите строку 14:
# export const DEV_ADMIN_PASSWORD = "admin123";

# Сохраните (Ctrl+O, Enter, Ctrl+X)
```

---

### 2. Добавить проверку слабых PIN-кодов

**Файл:** `/utils/security.ts`

**Добавить функцию:**
```typescript
/**
 * Check if PIN is weak
 * @param pin - PIN code to check
 * @returns True if PIN is weak
 */
export function isWeakPin(pin: string): boolean {
  // Список слабых PIN-кодов
  const weakPins = [
    '0000', '1111', '2222', '3333', '4444', '5555', '6666', '7777', '8888', '9999',
    '1234', '4321', '0123', '3210', '1212', '2121',
    '1004', '2580', // популярные
  ];
  
  if (weakPins.includes(pin)) {
    return true;
  }
  
  // Проверка на последовательность (1234, 5678)
  if (pin.length === 4) {
    const digits = pin.split('').map(Number);
    const isAscending = digits.every((d, i) => i === 0 || d === digits[i-1] + 1);
    const isDescending = digits.every((d, i) => i === 0 || d === digits[i-1] - 1);
    
    if (isAscending || isDescending) {
      return true;
    }
  }
  
  // Проверка на повторяющиеся пары (1212, 2323)
  if (pin.length === 4) {
    if (pin[0] === pin[2] && pin[1] === pin[3]) {
      return true;
    }
  }
  
  return false;
}
```

**Использовать в AuthScreen:**
```typescript
// В handleSetPinCode и handleResetPinCode
if (isWeakPin(formData.pinCode)) {
  alert('Этот PIN-код слишком простой. Выберите более сложный.');
  setIsLoading(false);
  return;
}
```

---

### 3. Добавить базовое логирование

**Создать файл:** `/utils/logger.ts`

```typescript
export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  SECURITY = 'security'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  event: string;
  metadata?: any;
}

class Logger {
  private logs: LogEntry[] = [];
  
  log(level: LogLevel, event: string, metadata?: any): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      event,
      metadata
    };
    
    // Сохранить в памяти
    this.logs.push(logEntry);
    
    // Ограничить размер (последние 1000 записей)
    if (this.logs.length > 1000) {
      this.logs.shift();
    }
    
    // Console log для разработки
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${level.toUpperCase()}]`, event, metadata);
    }
    
    // В production отправлять на backend
    if (process.env.NODE_ENV === 'production') {
      this.sendToBackend(logEntry);
    }
  }
  
  private sendToBackend(entry: LogEntry): void {
    // TODO: Отправить на backend когда будет API
    // fetch('/api/logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(entry)
    // });
  }
  
  info(event: string, metadata?: any): void {
    this.log(LogLevel.INFO, event, metadata);
  }
  
  warn(event: string, metadata?: any): void {
    this.log(LogLevel.WARN, event, metadata);
  }
  
  error(event: string, metadata?: any): void {
    this.log(LogLevel.ERROR, event, metadata);
  }
  
  security(event: string, metadata?: any): void {
    this.log(LogLevel.SECURITY, event, metadata);
  }
  
  getLogs(): LogEntry[] {
    return [...this.logs];
  }
  
  getSecurityLogs(): LogEntry[] {
    return this.logs.filter(log => log.level === LogLevel.SECURITY);
  }
}

export const logger = new Logger();
```

**Использовать в AuthScreen:**
```typescript
import { logger } from '../utils/logger';

// При успешном входе
logger.security('login_success', {
  phone: formData.phone,
  timestamp: Date.now()
});

// При неудачной попытке
logger.security('login_failed', {
  phone: formData.phone,
  reason: 'invalid_credentials',
  remainingAttempts: remaining
});

// При блокировке
logger.security('account_locked', {
  phone: formData.phone,
  duration: rateLimitCheck.remainingTime
});
```

---

### 4. Добавить CSP заголовки

**Файл:** `index.html`

**Добавить в `<head>`:**
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
">
<meta http-equiv="X-Frame-Options" content="DENY">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
```

---

### 5. Обобщить сообщения об ошибках

**Файлы:** `/components/AuthScreen.tsx`, `/components/ProfilePage.tsx`

**Заменить детальные ошибки:**

```typescript
// БЫЛО:
if (!user) {
  setLoginError('Пользователь не найден. Осталось попыток: ${remaining}');
}

// СТАЛО:
if (!user) {
  setLoginError('Неверные учетные данные. Осталось попыток: ${remaining}');
}
```

```typescript
// БЫЛО:
if (!isCurrentPinValid) {
  alert('Неверный текущий пин-код');
}

// СТАЛО:
if (!isCurrentPinValid) {
  alert('Неверные данные');
}
```

---

## 🟠 Высокий приоритет: Исправить в течение недели

### 6. HTTPS enforcement

**Файл:** `/App.tsx`

**Добавить в начало компонента:**
```typescript
useEffect(() => {
  // Enforce HTTPS in production
  if (process.env.NODE_ENV === 'production' && 
      window.location.protocol !== 'https:' && 
      window.location.hostname !== 'localhost') {
    window.location.href = `https://${window.location.host}${window.location.pathname}`;
  }
}, []);
```

---

### 7. Улучшить Rate Limiter с логированием

**Файл:** `/utils/security.ts`

**Обновить метод `recordAttempt`:**
```typescript
import { logger } from './logger';

recordAttempt(identifier: string): void {
  const now = Date.now();
  const record = this.attempts.get(identifier);

  if (!record) {
    this.attempts.set(identifier, { count: 1, lastAttempt: now });
  } else {
    const timeSinceLastAttempt = now - record.lastAttempt;
    
    if (timeSinceLastAttempt > this.windowMs) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
    } else {
      record.count++;
      record.lastAttempt = now;
      
      // Логировать подозрительную активность
      if (record.count >= this.maxAttempts - 2) {
        logger.security('suspicious_login_attempts', {
          identifier,
          attempts: record.count,
          maxAttempts: this.maxAttempts
        });
      }
      
      // Логировать блокировку
      if (record.count >= this.maxAttempts) {
        logger.security('rate_limit_exceeded', {
          identifier,
          attempts: record.count,
          lockoutDuration: this.lockoutMs / 1000 / 60 + ' minutes'
        });
      }
    }
  }
}
```

---

### 8. Усложнить восстановление доступа

**Файл:** `/components/AuthScreen.tsx`

**Обновить функцию `handleForgotPin`:**
```typescript
const handleForgotPin = (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.phone || !formData.accountNumber) {
    alert('Введите номер телефона и лицевой счет');
    return;
  }

  const user = registeredUsers.find(
    u => u.phone === formData.phone && u.accountNumber === formData.accountNumber
  );

  if (!user) {
    // Обобщенное сообщение
    alert('Неверные данные или пользователь не найден.');
    
    // Логировать попытку
    logger.security('password_reset_failed', {
      phone: formData.phone,
      accountNumber: formData.accountNumber
    });
    return;
  }
  
  // Логировать успешную инициацию
  logger.security('password_reset_initiated', {
    phone: formData.phone,
    accountNumber: formData.accountNumber
  });

  // В production здесь должна быть отправка SMS/Email с кодом
  // const verificationCode = Math.random().toString().slice(2, 8);
  // await sendSMS(user.phone, `Код для сброса PIN: ${verificationCode}`);
  // await sendEmail(user.email, `Код для сброса PIN: ${verificationCode}`);
  
  // Показать предупреждение
  alert('В production на ваш телефон и email будут отправлены коды для подтверждения.');

  setTempUserData(user);
  setAuthState('setPinCode');
  setFormData({ ...formData, pinCode: '', pinCodeConfirm: '' });
};
```

---

## 🟡 Средний приоритет: Исправить в течение месяца

### 9. Добавить HMAC для localStorage

**Файл:** `/utils/security.ts`

**Добавить функции:**
```typescript
/**
 * Sign data with HMAC-SHA256
 */
export async function signData(data: any): Promise<{ data: any; signature: string }> {
  const dataStr = JSON.stringify(data);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(dataStr);
  
  // В production использовать секрет из env
  const secret = process.env.VITE_HMAC_SECRET || 'dev-secret-key';
  const keyBuffer = encoder.encode(secret);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, dataBuffer);
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signature = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return { data, signature };
}

/**
 * Verify HMAC signature
 */
export async function verifySignature(
  data: any,
  signature: string
): Promise<boolean> {
  const signed = await signData(data);
  return signed.signature === signature;
}
```

**Использовать в AuthScreen:**
```typescript
// При сохранении пользователей
const signedData = await signData(registeredUsers);
localStorage.setItem('registeredUsers', JSON.stringify(signedData.data));
localStorage.setItem('registeredUsers_sig', signedData.signature);

// При загрузке пользователей
const storedData = localStorage.getItem('registeredUsers');
const storedSig = localStorage.getItem('registeredUsers_sig');

if (storedData && storedSig) {
  const users = JSON.parse(storedData);
  const isValid = await verifySignature(users, storedSig);
  
  if (!isValid) {
    logger.security('data_integrity_violation', { key: 'registeredUsers' });
    alert('Обнаружено изменение данных! Очистка...');
    localStorage.clear();
    return;
  }
  
  setRegisteredUsers(users);
}
```

---

### 10. Добавить Device Fingerprinting

**Установить библиотеку:**
```bash
npm install @fingerprintjs/fingerprintjs
```

**Создать файл:** `/utils/deviceFingerprint.ts`

```typescript
import FingerprintJS from '@fingerprintjs/fingerprintjs';

let fpPromise: Promise<any> | null = null;

export async function getDeviceFingerprint(): Promise<string> {
  if (!fpPromise) {
    fpPromise = FingerprintJS.load();
  }
  
  const fp = await fpPromise;
  const result = await fp.get();
  return result.visitorId;
}

export async function verifyDeviceFingerprint(storedFingerprint: string): Promise<boolean> {
  const currentFingerprint = await getDeviceFingerprint();
  return currentFingerprint === storedFingerprint;
}
```

**Использовать для "Remember me":**
```typescript
// При сохранении
if (rememberMe) {
  const fingerprint = await getDeviceFingerprint();
  const hashedPin = await hashPassword(formData.pinCode);
  
  localStorage.setItem('rememberedPhone', formData.phone);
  localStorage.setItem('rememberedPinCode', hashedPin);
  localStorage.setItem('deviceFingerprint', fingerprint);
}

// При загрузке
const savedFingerprint = localStorage.getItem('deviceFingerprint');
if (savedFingerprint) {
  const isValid = await verifyDeviceFingerprint(savedFingerprint);
  if (!isValid) {
    logger.security('device_fingerprint_mismatch', {
      phone: savedPhone
    });
    // Очистить "remember me"
    localStorage.removeItem('rememberedPhone');
    localStorage.removeItem('rememberedPinCode');
    localStorage.removeItem('deviceFingerprint');
  }
}
```

---

## 📋 Чеклист исправлений

### Критичные (сделать сейчас):
- [ ] ✅ Удалить DEV_ADMIN_PASSWORD
- [ ] ✅ Добавить проверку слабых PIN
- [ ] ✅ Добавить базовое логирование
- [ ] ✅ Добавить CSP заголовки
- [ ] ✅ Обобщить сообщения об ошибках

### Высокий приоритет (эта неделя):
- [ ] ✅ HTTPS enforcement
- [ ] ✅ Логирование в Rate Limiter
- [ ] ✅ Усложнить восстановление доступа

### Средний приоритет (этот месяц):
- [ ] ✅ HMAC для localStorage
- [ ] ✅ Device Fingerprinting

---

## 🧪 Тестирование после исправлений

### 1. Проверка слабых PIN
```typescript
// Попробовать установить PIN 1234
// Должно отклонить с сообщением "слишком простой"
```

### 2. Проверка логирования
```typescript
// Открыть консоль DevTools
// Попробовать войти
// Должны появиться логи
```

### 3. Проверка CSP
```typescript
// Открыть DevTools → Console
// Не должно быть ошибок CSP
// Проверить Network → Headers
```

### 4. Проверка HTTPS
```typescript
// Попробовать открыть через HTTP (не localhost)
// Должно перенаправить на HTTPS
```

---

## ⏱️ Время на исправления

| Исправление | Время | Сложность |
|-------------|-------|-----------|
| Удалить пароль | 2 мин | Легко |
| Проверка PIN | 15 мин | Средне |
| Логирование | 30 мин | Средне |
| CSP заголовки | 5 мин | Легко |
| Обобщить ошибки | 10 мин | Легко |
| HTTPS enforcement | 5 мин | Легко |
| Улучшить Rate Limiter | 15 мин | Средне |
| Усложнить восстановление | 20 мин | Средне |
| HMAC | 45 мин | Сложно |
| Device Fingerprinting | 30 мин | Средне |
| **ИТОГО** | **~3 часа** | |

---

## 🆘 Если что-то сломалось

### Откатить изменения:
```bash
git reset --hard HEAD~1  # Откатить последний commit
git stash                # Спрятать изменения
```

### Восстановить backup:
```bash
cp backup/AuthScreen.tsx components/AuthScreen.tsx
```

### Обратиться за помощью:
- 📧 Email: support@example.com
- 🐛 GitHub Issues: [создать issue](../../issues)

---

<div align="center">

**После исправлений проект будет готов к безопасному использованию! 🔒**

</div>
