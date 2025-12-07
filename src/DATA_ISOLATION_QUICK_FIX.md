# ⚡ Быстрое исправление изоляции данных (30 минут)

**Минимальный набор изменений для устранения критической уязвимости**

---

## 🎯 Цель

Сделать так, чтобы пользователь A **НЕ МОГ** получить данные пользователя B.

---

## 📋 Шаг 1: Добавить импорты (2 минуты)

### Файл: `/components/AuthScreen.tsx`

**В начало файла добавить:**

```typescript
import { DataIsolationManager, DataMigration } from '../utils/dataIsolation';
```

---

## 📋 Шаг 2: Добавить миграцию (5 минут)

### Файл: `/App.tsx`

**Добавить в начало компонента:**

```typescript
import { useEffect } from 'react';
import { DataMigration, SecurityAudit } from './utils/dataIsolation';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Добавить этот useEffect:
  useEffect(() => {
    // Миграция со старого формата
    const hasOldFormat = localStorage.getItem('registeredUsers');
    if (hasOldFormat) {
      console.warn('[MIGRATION] Migrating to secure storage...');
      DataMigration.migrateFromLegacyStorage().then(() => {
        console.log('[MIGRATION] Migration completed');
      });
    }
    
    // Запустить аудит безопасности
    if (process.env.NODE_ENV === 'development') {
      SecurityAudit.runAudit();
    }
  }, []);

  // ... rest of the code
}
```

---

## 📋 Шаг 3: Обновить загрузку пользователей (3 минуты)

### Файл: `/components/AuthScreen.tsx`

**БЫЛО:**
```typescript
// Load users from localStorage on mount
useEffect(() => {
  const storedUsers = localStorage.getItem('registeredUsers');
  if (storedUsers) {
    const users = JSON.parse(storedUsers);
    setRegisteredUsers(users);
    setAuthState('login');
  } else {
    setAuthState('register');
  }
  
  // ... rest
}, []);
```

**СТАЛО:**
```typescript
// Load users from localStorage on mount
useEffect(() => {
  // Check if any users are registered
  const phones = DataIsolationManager.getAllRegisteredPhones();
  if (phones.length > 0) {
    // Users exist, show login
    setAuthState('login');
  } else {
    // No users, show registration
    setAuthState('register');
  }
  
  // Check for saved credentials (keep existing code)
  const savedPhone = localStorage.getItem('rememberedPhone');
  const savedPinCode = localStorage.getItem('rememberedPinCode');
  if (savedPhone && savedPinCode) {
    setFormData(prev => ({ ...prev, phone: savedPhone, pinCode: savedPinCode }));
    setRememberMe(true);
  }
}, []);
```

**УДАЛИТЬ:**
```typescript
// Save users to localStorage whenever they change
useEffect(() => {
  if (registeredUsers.length > 0) {
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
  }
}, [registeredUsers]);
```

---

## 📋 Шаг 4: Обновить логин (5 минут)

### Файл: `/components/AuthScreen.tsx`

**Найти функцию `handleLogin`:**

**БЫЛО:**
```typescript
const user = registeredUsers.find(u => u.phone === formData.phone);

if (!user) {
  // error handling
}

const isPinValid = await verifyPassword(formData.pinCode, user.pinCode);

if (isPinValid) {
  // success
  onAuth(user);
}
```

**СТАЛО:**
```typescript
// Verify credentials using isolated storage
const user = await DataIsolationManager.verifyCredentials(
  formData.phone,
  formData.pinCode
);

if (!user) {
  loginRateLimiter.recordAttempt(formData.phone);
  rateLimiter.recordAttempt(formData.phone, ActionType.LOGIN, false);
  setLoginAttempts(prev => prev + 1);
  const remaining = loginRateLimiter.getRemainingAttempts(formData.phone);
  setLoginError(`Неверные учетные данные. Осталось попыток: ${remaining}`);
  setIsLoading(false);
  toast.warning(`Осталось попыток: ${remaining}`);
  return;
}

// Success - create session
loginRateLimiter.resetAttempts(formData.phone);
rateLimiter.reset(formData.phone, ActionType.LOGIN);
setLoginAttempts(0);
setCaptchaVerified(false);

// Create isolated session
DataIsolationManager.createSession(user.phone);

// Save credentials if "Remember me" is checked
if (rememberMe) {
  const hashedPin = await hashPassword(formData.pinCode);
  localStorage.setItem('rememberedPhone', formData.phone);
  localStorage.setItem('rememberedPinCode', hashedPin);
} else {
  localStorage.removeItem('rememberedPhone');
  localStorage.removeItem('rememberedPinCode');
}

setIsLoading(false);
toast.success('Вход выполнен успешно!');
onAuth(user);
```

---

## 📋 Шаг 5: Обновить регистрацию (5 минут)

### Файл: `/components/AuthScreen.tsx`

**Найти функцию `handleRegister`:**

**БЫЛО:**
```typescript
// Check if phone already registered
if (registeredUsers.some(u => u.phone === formData.phone)) {
  alert('Пользователь с таким номером телефона уже зарегистрирован');
  return;
}
```

**СТАЛО:**
```typescript
// Check if phone already registered (using isolated storage)
const exists = await DataIsolationManager.userExists(formData.phone);
if (exists) {
  rateLimiter.recordAttempt(formData.phone, ActionType.REGISTRATION, false);
  toast.error('Пользователь с таким номером уже зарегистрирован');
  alert('Пользователь с таким номером телефона уже зарегистрирован');
  return;
}
```

**Найти функцию `handleSetPinCode`:**

**БЫЛО:**
```typescript
const newUser: User = {
  ...tempUserData,
  pinCode: hashedPin
};

setRegisteredUsers([...registeredUsers, newUser]);
setTempUserData(null);
```

**СТАЛО:**
```typescript
const newUser: User = {
  ...tempUserData,
  pinCode: hashedPin
};

// Store user in isolated storage
await DataIsolationManager.storeUserData(newUser);

// Create session
DataIsolationManager.createSession(newUser.phone);

setTempUserData(null);
toast.success('Регистрация успешно завершена!');
```

---

## 📋 Шаг 6: Обновить сброс PIN (3 минуты)

### Файл: `/components/AuthScreen.tsx`

**Найти функцию `handleForgotPin`:**

**БЫЛО:**
```typescript
const user = registeredUsers.find(
  u => u.phone === formData.phone && u.accountNumber === formData.accountNumber
);
```

**СТАЛО:**
```typescript
// Verify phone exists
const exists = await DataIsolationManager.userExists(formData.phone);
if (!exists) {
  alert('Неверные данные или пользователь не найден.');
  logger.security('password_reset_failed', {
    phone: formData.phone,
    accountNumber: formData.accountNumber
  });
  return;
}

// Get public data to verify account number
// Note: In production this should be verified on backend
const user = await DataIsolationManager.getUserData(formData.phone);
if (!user || user.accountNumber !== formData.accountNumber) {
  alert('Неверные данные или пользователь не найден.');
  logger.security('password_reset_failed', {
    phone: formData.phone,
    reason: 'account_mismatch'
  });
  return;
}
```

**И в функции `handleResetPinCode`:**

**БЫЛО:**
```typescript
const updatedUser: User = {
  ...tempUserData,
  pinCode: hashedPin
};

const updatedUsers = registeredUsers.map(u =>
  u.phone === tempUserData.phone ? updatedUser : u
);
setRegisteredUsers(updatedUsers);
```

**СТАЛО:**
```typescript
const updatedUser: User = {
  ...tempUserData,
  pinCode: hashedPin
};

// Update in isolated storage
await DataIsolationManager.storeUserData(updatedUser);

// Create new session
DataIsolationManager.createSession(updatedUser.phone);

toast.success('PIN-код успешно изменен!');
```

---

## 📋 Шаг 7: Обновить ProfilePage (5 минут)

### Файл: `/components/ProfilePage.tsx`

**Найти функцию изменения PIN:**

**БЫЛО:**
```typescript
// Update in localStorage
const storedUsers = localStorage.getItem('registeredUsers');
if (storedUsers) {
  const users: UserType[] = JSON.parse(storedUsers);
  const updatedUsers = users.map(u => u.phone === user.phone ? updatedUser : u);
  localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
}
```

**СТАЛО:**
```typescript
// Update in isolated storage
const success = await DataIsolationManager.updateUserData(updatedUser);
if (!success) {
  toast.error('Не удалось обновить данные');
  return;
}
```

---

## 📋 Шаг 8: Обновить выход (2 минуты)

### Файл: `/components/MainApp.tsx`

**Найти где вызывается `onLogout`:**

**БЫЛО:**
```typescript
onClick={onLogout}
```

**СТАЛО:**
```typescript
onClick={() => {
  DataIsolationManager.destroySession();
  onLogout();
}}
```

---

## 📋 Шаг 9: Обновить AdminPanel (опционально, 3 минуты)

### Файл: `/components/admin/AdminPanel.tsx` или `/components/AdminPanel.tsx`

**Найти где загружаются пользователи:**

**БЫЛО:**
```typescript
const storedUsers = localStorage.getItem('registeredUsers');
const users = JSON.parse(storedUsers);
```

**СТАЛО:**
```typescript
import { DataIsolationManager } from '../utils/dataIsolation';

// При входе админа создать admin session
useEffect(() => {
  DataIsolationManager.createAdminSession();
  
  return () => {
    DataIsolationManager.destroyAdminSession();
  };
}, []);

// Получить всех пользователей (только для админа)
const users = await DataIsolationManager.getAllUsersForAdmin();
```

---

## 📋 Шаг 10: Удалить state registeredUsers (2 минуты)

### Файл: `/components/AuthScreen.tsx`

**УДАЛИТЬ:**
```typescript
const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
```

Это состояние больше не нужно, так как данные хранятся изолированно.

---

## ✅ Проверка (5 минут)

### Тест 1: Проверка изоляции

```javascript
// Открыть DevTools → Console
// Попытаться получить старый массив:
console.log(localStorage.getItem('registeredUsers'));
// ✅ Должно быть: null (или backup)

// Попытаться получить чужие данные:
const otherUser = await DataIsolationManager.getUserData('+79990000000');
console.log(otherUser);
// ✅ Должно быть: null
// ✅ В консоли: "[SECURITY] Unauthorized access attempt"
```

### Тест 2: Проверка логина

```
1. Зарегистрировать нового пользователя
2. Выйти
3. Войти с этими же данными
4. ✅ Вход должен пройти успешно
```

### Тест 3: Проверка миграции

```javascript
// Если были старые данные:
const backup = localStorage.getItem('registeredUsers_backup');
console.log(backup);
// ✅ Должны быть старые данные в backup
```

### Тест 4: Security Audit

```javascript
import { SecurityAudit } from './utils/dataIsolation';

SecurityAudit.runAudit();
// ✅ Должно быть: "✓ No security issues found"
```

---

## 🎉 Готово!

После выполнения всех шагов:

- ✅ Пользователь A не может получить данные пользователя B
- ✅ Все данные изолированы
- ✅ Создаются сессии для контроля доступа
- ✅ Старые данные автоматически мигрированы

---

## 🔄 Rollback (если что-то пошло не так)

```typescript
import { DataMigration } from './utils/dataIsolation';

// Откатить миграцию:
DataMigration.rollbackMigration();

// Данные вернутся в старый формат
```

---

## 📊 Чек-лист

- [ ] ✅ Импорты добавлены
- [ ] ✅ Миграция добавлена в App.tsx
- [ ] ✅ Загрузка пользователей обновлена
- [ ] ✅ Логин использует изолированное хранилище
- [ ] ✅ Регистрация сохраняет в изолированное хранилище
- [ ] ✅ Сброс PIN работает с изоляцией
- [ ] ✅ ProfilePage обновляет через DataIsolationManager
- [ ] ✅ Выход уничтожает сессию
- [ ] ✅ AdminPanel работает с admin session
- [ ] ✅ State registeredUsers удален
- [ ] ✅ Тесты пройдены
- [ ] ✅ Security audit passed

---

## ⏱️ Итого

**Время:** ~30 минут  
**Сложность:** Средняя  
**Эффект:** Критическая уязвимость устранена!

---

## 🆘 Помощь

Если возникли проблемы:

1. Проверьте консоль браузера на ошибки
2. Проверьте что все импорты корректны
3. Запустите `SecurityAudit.runAudit()`
4. Проверьте что старый `registeredUsers` удален/мигрирован

**Контакты:** security@example.com

