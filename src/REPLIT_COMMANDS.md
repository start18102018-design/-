# ⚡ Replit - Команды и шпаргалка

## 🚀 Основные команды

### Первоначальная настройка

```bash
# Установка зависимостей
npm install

# Или с yarn
yarn install
```

---

### Разработка

```bash
# Запуск dev-сервера (порт 5173)
npm run dev

# С автоматическим открытием браузера
npm run dev -- --open

# С очисткой кеша
npm run dev -- --force
```

---

### Production

```bash
# Создать production build
npm run build

# Просмотр production build
npm run preview

# Build + Preview
npm run build && npm run preview
```

---

### Очистка

```bash
# Удалить node_modules и переустановить
rm -rf node_modules package-lock.json && npm install

# Очистить кеш Vite
rm -rf node_modules/.vite

# Полная очистка
rm -rf node_modules package-lock.json dist .vite && npm install
```

---

## 🔧 Replit-специфичные команды

### Shell команды

```bash
# Проверка версии Node.js
node --version

# Проверка версии npm
npm --version

# Список установленных пакетов
npm list --depth=0

# Проверка устаревших пакетов
npm outdated

# Обновить пакеты
npm update
```

---

### Debugging

```bash
# Запуск с подробными логами
npm run dev -- --debug

# Проверка конфигурации Vite
npx vite --help

# Показать config
npx vite config
```

---

### Process management

```bash
# Убить все Node процессы (если зависло)
killall node

# Найти процесс на порту 5173
lsof -i :5173

# Убить процесс по PID
kill -9 <PID>
```

---

## 📦 Управление пакетами

### Установка

```bash
# Установить пакет
npm install <package-name>

# Установить dev-зависимость
npm install -D <package-name>

# Установить конкретную версию
npm install <package-name>@<version>

# Примеры:
npm install lucide-react
npm install -D @types/react
npm install typescript@5.2.2
```

---

### Удаление

```bash
# Удалить пакет
npm uninstall <package-name>

# Удалить dev-зависимость
npm uninstall -D <package-name>
```

---

### Обновление

```bash
# Обновить один пакет
npm update <package-name>

# Обновить все пакеты
npm update

# Обновить до последних версий (игнорируя semver)
npm install <package-name>@latest
```

---

## 🧪 Тестирование и проверки

### Security Audit

```bash
# В Shell:
node -e "console.log('Starting security audit...'); setTimeout(() => {}, 1000);"

# Или откройте Console в браузере (F12) и выполните:
# SecurityAudit.runAudit();
```

---

### Build проверка

```bash
# Проверка TypeScript
npx tsc --noEmit

# Проверка с подробным выводом
npx tsc --noEmit --pretty

# Линтинг
npm run lint
```

---

## 🌐 Deployment команды

### Replit Deploy

```bash
# Production build для deployment
npm run build

# Запуск production сервера
npx serve dist -s -p $PORT

# С логированием
npx serve dist -s -p $PORT --debug
```

---

### Static server

```bash
# Установить serve глобально
npm install -g serve

# Запустить static server
serve dist

# С конкретным портом
serve dist -p 3000

# С CORS
serve dist --cors
```

---

## 🔍 Диагностика

### Проверка окружения

```bash
# Переменные окружения
printenv | grep NODE
printenv | grep npm

# Путь к Node.js
which node

# Путь к npm
which npm

# Проверка доступных портов
netstat -tuln | grep LISTEN
```

---

### Проверка конфигурации

```bash
# Показать package.json
cat package.json

# Показать .replit
cat .replit

# Показать vite.config.ts
cat vite.config.ts

# Список файлов в проекте
ls -la

# Древо файлов
tree -L 2 -I 'node_modules'
```

---

## 💾 Работа с файлами

### Backup

```bash
# Создать backup package.json
cp package.json package.json.backup

# Создать backup всего проекта (кроме node_modules)
tar -czf backup.tar.gz --exclude='node_modules' .

# Восстановить из backup
tar -xzf backup.tar.gz
```

---

### Поиск

```bash
# Найти файл
find . -name "*.tsx" -type f

# Поиск по содержимому
grep -r "DataIsolationManager" --include="*.tsx" --include="*.ts"

# Количество строк кода
find . -name "*.tsx" -o -name "*.ts" | xargs wc -l
```

---

## 🐛 Решение частых проблем

### Проблема 1: Port already in use

```bash
# Найти процесс на порту
lsof -i :5173

# Убить процесс
kill -9 $(lsof -t -i :5173)

# Или убить все Node процессы
killall node

# Запустить заново
npm run dev
```

---

### Проблема 2: Module not found

```bash
# Очистить и переустановить
rm -rf node_modules package-lock.json
npm install

# Очистить кеш npm
npm cache clean --force
npm install
```

---

### Проблема 3: TypeScript errors

```bash
# Переустановить TypeScript
npm uninstall typescript
npm install -D typescript@5.2.2

# Удалить tsconfig кеш
rm -rf node_modules/.cache
```

---

### Проблема 4: Vite не запускается

```bash
# Очистить кеш Vite
rm -rf node_modules/.vite

# Переустановить Vite
npm uninstall vite @vitejs/plugin-react
npm install -D vite@5.0.8 @vitejs/plugin-react@4.2.1

# Запустить с флагом force
npm run dev -- --force
```

---

### Проблема 5: Белый экран

```bash
# Проверить консоль браузера (F12)
# Проверить что dev-сервер запущен
ps aux | grep vite

# Перезапустить с логами
npm run dev -- --debug
```

---

## 📊 Мониторинг

### Производительность

```bash
# Размер node_modules
du -sh node_modules

# Размер dist
du -sh dist

# Размер всего проекта
du -sh .

# Top 10 самых больших файлов
find . -type f -exec du -h {} + | sort -rh | head -n 10
```

---

### Логи

```bash
# Показать последние 50 строк логов
npm run dev 2>&1 | tail -n 50

# Сохранить логи в файл
npm run dev > dev.log 2>&1

# Следить за логами в реальном времени
tail -f dev.log
```

---

## 🔐 Security

### Проверка уязвимостей

```bash
# Audit зависимостей
npm audit

# Исправить автоматически
npm audit fix

# Показать уязвимые пакеты
npm audit --json | grep severity
```

---

### Обновление безопасности

```bash
# Обновить только пакеты с уязвимостями
npm audit fix

# Принудительное обновление (может сломать совместимость)
npm audit fix --force

# Проверка после обновления
npm audit
```

---

## 🎯 Полезные алиасы

Добавьте в `.bashrc` или `.zshrc` (если есть доступ):

```bash
# Алиасы для Replit
alias dev="npm run dev"
alias build="npm run build"
alias clean="rm -rf node_modules package-lock.json && npm install"
alias restart="killall node && npm run dev"
alias audit="npm audit"
alias update="npm update"
```

---

## 📝 Git команды (если используете)

```bash
# Инициализация репозитория
git init

# Добавить все файлы
git add .

# Коммит
git commit -m "Initial commit"

# Привязать к GitHub
git remote add origin <your-repo-url>

# Отправить в GitHub
git push -u origin main

# .gitignore (создайте файл)
cat > .gitignore << EOF
node_modules/
dist/
.env
*.log
.DS_Store
EOF
```

---

## 🚀 Production Deployment

### Vercel

```bash
# Установить Vercel CLI
npm install -g vercel

# Deploy
vercel

# Production deploy
vercel --prod
```

---

### Netlify

```bash
# Установить Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Production deploy
netlify deploy --prod
```

---

## 💡 Pro Tips

### Горячие клавиши Replit

- `Ctrl/Cmd + S` - Сохранить (автосейв и так работает)
- `Ctrl/Cmd + K` - Быстрый поиск файлов
- `Ctrl/Cmd + Shift + F` - Поиск в проекте
- `Ctrl/Cmd + /` - Закомментировать строку
- `Ctrl/Cmd + D` - Дублировать строку

---

### Быстрые команды

```bash
# Одной командой: очистка + установка + запуск
rm -rf node_modules package-lock.json && npm install && npm run dev

# Быстрый restart
killall node; npm run dev

# Build и preview одной командой
npm run build && npm run preview
```

---

## 📞 Помощь

Если команда не работает:

1. Проверьте, что находитесь в корне проекта: `pwd`
2. Проверьте наличие `package.json`: `ls package.json`
3. Проверьте синтаксис команды: `npm run --help`
4. Посмотрите полные логи ошибки
5. Попробуйте очистить кеш: `npm cache clean --force`

---

**Последнее обновление:** 7 декабря 2025  
**Версия:** 1.0.0
