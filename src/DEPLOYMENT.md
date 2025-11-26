# 🚀 Руководство по развертыванию

Это руководство поможет вам развернуть приложение на различных платформах.

---

## 📋 Оглавление

- [Подготовка к деплою](#подготовка-к-деплою)
- [Локальная сборка](#локальная-сборка)
- [Vercel](#vercel)
- [Netlify](#netlify)
- [GitHub Pages](#github-pages)
- [Docker](#docker)
- [VPS/Dedicated Server](#vpsdedicated-server)
- [Переменные окружения](#переменные-окружения)
- [Мониторинг](#мониторинг)

---

## 🛠️ Подготовка к деплою

### 1. Обновите конфигурацию

#### `.env` файл
```bash
# Скопируйте .env.example
cp .env.example .env

# Отредактируйте значения
nano .env
```

**Важные переменные:**
```env
# ОБЯЗАТЕЛЬНО измените в production!
VITE_ADMIN_PASSWORD_HASH=your_secure_hash_here
VITE_SESSION_TIMEOUT_MINUTES=30
VITE_MAX_LOGIN_ATTEMPTS=5

# Контакты поддержки
VITE_SUPPORT_EMAIL=support@yourdomain.com
VITE_SUPPORT_PHONE=+7 (XXX) XXX-XX-XX
```

#### Генерация безопасного хеша
```bash
# Используйте утилиту для генерации хеша
node -e "const crypto = require('crypto'); console.log(crypto.createHash('sha256').update('YourSecurePassword123!').digest('hex'));"
```

### 2. Проверьте код

```bash
# Запустите линтер
npm run lint

# Запустите тесты
npm test

# Проверьте сборку
npm run build
```

---

## 🏗️ Локальная сборка

### Разработка
```bash
npm run dev
# Приложение доступно на http://localhost:5173
```

### Production preview
```bash
npm run build
npm run preview
# Preview доступен на http://localhost:4173
```

### Проверка bundle size
```bash
npm run build -- --mode production
# Анализируйте dist/ папку
```

---

## ▲ Vercel (Рекомендуется)

### Автоматический деплой

1. **Загрузите проект на GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

2. **Импортируйте в Vercel**
   - Зайдите на [vercel.com](https://vercel.com)
   - Нажмите "Import Project"
   - Выберите ваш репозиторий
   - Vercel автоматически определит настройки

3. **Настройте переменные окружения**
   - Settings → Environment Variables
   - Добавьте все переменные из `.env`

4. **Deploy!**
   - Нажмите Deploy
   - Каждый push в main автоматически деплоится

### Vercel CLI
```bash
# Установите Vercel CLI
npm i -g vercel

# Войдите в аккаунт
vercel login

# Задеплойте
vercel --prod
```

### `vercel.json` конфигурация
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ],
  "env": {
    "VITE_ADMIN_PASSWORD_HASH": "@admin-password-hash"
  }
}
```

---

## 🌐 Netlify

### Автоматический деплой

1. **Загрузите на GitHub** (см. выше)

2. **Подключите Netlify**
   - Зайдите на [netlify.com](https://netlify.com)
   - New site from Git → GitHub
   - Выберите репозиторий

3. **Настройки сборки**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

4. **Environment Variables**
   - Site settings → Environment variables
   - Добавьте переменные из `.env`

### Netlify CLI
```bash
# Установите Netlify CLI
npm i -g netlify-cli

# Войдите
netlify login

# Инициализируйте проект
netlify init

# Задеплойте
netlify deploy --prod
```

### `netlify.toml` конфигурация
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

---

## 📄 GitHub Pages

### Автоматический деплой через GitHub Actions

1. **Создайте workflow файл**

`.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_ADMIN_PASSWORD_HASH: ${{ secrets.ADMIN_PASSWORD_HASH }}

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v3
```

2. **Настройте base path в `vite.config.ts`**
```typescript
export default defineConfig({
  base: '/your-repo-name/',
  // ...
});
```

3. **Включите GitHub Pages**
   - Settings → Pages
   - Source: GitHub Actions

4. **Добавьте секреты**
   - Settings → Secrets → Actions
   - Добавьте `ADMIN_PASSWORD_HASH`

---

## 🐳 Docker

### Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
}
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_ADMIN_PASSWORD_HASH=${ADMIN_PASSWORD_HASH}
    restart: unless-stopped
```

### Сборка и запуск
```bash
# Сборка образа
docker build -t utility-app .

# Запуск контейнера
docker run -d -p 80:80 --name utility-app utility-app

# Или с docker-compose
docker-compose up -d
```

---

## 🖥️ VPS/Dedicated Server

### Требования
- Ubuntu 22.04+ / Debian 11+
- Node.js 18+
- Nginx
- SSL сертификат (Let's Encrypt)

### Установка

#### 1. Подготовка сервера
```bash
# Обновите систему
sudo apt update && sudo apt upgrade -y

# Установите Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Установите Nginx
sudo apt install -y nginx

# Установите Certbot (для SSL)
sudo apt install -y certbot python3-certbot-nginx
```

#### 2. Клонируйте проект
```bash
cd /var/www
sudo git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git utility-app
cd utility-app
sudo npm install
```

#### 3. Настройте .env
```bash
sudo cp .env.example .env
sudo nano .env
```

#### 4. Соберите проект
```bash
sudo npm run build
```

#### 5. Настройте Nginx
```bash
sudo nano /etc/nginx/sites-available/utility-app
```

Содержимое:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/utility-app/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

Включите конфигурацию:
```bash
sudo ln -s /etc/nginx/sites-available/utility-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. Получите SSL сертификат
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

#### 7. Настройте автообновление
```bash
# Создайте deploy скрипт
sudo nano /var/www/utility-app/deploy.sh
```

Содержимое:
```bash
#!/bin/bash
cd /var/www/utility-app
git pull origin main
npm install
npm run build
sudo systemctl reload nginx
echo "Deploy completed at $(date)"
```

Сделайте исполняемым:
```bash
sudo chmod +x /var/www/utility-app/deploy.sh
```

#### 8. Настройте GitHub Webhook (опционально)
Создайте endpoint для автоматического деплоя при push.

---

## 🔐 Переменные окружения

### Production переменные

| Переменная | Описание | Пример |
|-----------|----------|--------|
| `VITE_ADMIN_PASSWORD_HASH` | SHA-256 хеш пароля админа | `8c6976e5b5...` |
| `VITE_MAX_LOGIN_ATTEMPTS` | Максимум попыток входа | `5` |
| `VITE_LOCKOUT_DURATION_MINUTES` | Время блокировки (мин) | `30` |
| `VITE_SESSION_TIMEOUT_MINUTES` | Таймаут сессии (мин) | `30` |
| `VITE_SUPPORT_EMAIL` | Email поддержки | `support@example.com` |
| `VITE_SUPPORT_PHONE` | Телефон поддержки | `+7 (XXX) XXX-XX-XX` |

### Как добавить переменные

**Vercel:**
```bash
vercel env add VITE_ADMIN_PASSWORD_HASH production
```

**Netlify:**
```bash
netlify env:set VITE_ADMIN_PASSWORD_HASH "your-hash"
```

**Docker:**
```bash
docker run -e VITE_ADMIN_PASSWORD_HASH="your-hash" ...
```

---

## 📊 Мониторинг

### Проверка здоровья сайта

```bash
# Проверка доступности
curl -I https://yourdomain.com

# Проверка SSL
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

### Логи

**Nginx:**
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

**Docker:**
```bash
docker logs -f utility-app
```

### Метрики

Рекомендуемые сервисы:
- **UptimeRobot** - мониторинг доступности
- **Google Analytics** - аналитика посетителей
- **Sentry** - отслеживание ошибок
- **LogRocket** - session replay

---

## 🔒 Безопасность Production

### Обязательные меры:

✅ **HTTPS обязателен**
```bash
# Проверьте SSL сертификат
sudo certbot certificates
```

✅ **Security headers**
Настройте в Nginx/Vercel/Netlify:
```
Content-Security-Policy
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```

✅ **Firewall**
```bash
# UFW на Ubuntu
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

✅ **Регулярные обновления**
```bash
# Обновляйте зависимости
npm audit
npm update
```

✅ **Бэкапы**
Настройте автоматические бэкапы конфигураций и данных.

---

## 🆘 Troubleshooting

### Проблема: Белый экран после деплоя
**Решение:**
```bash
# Проверьте base path в vite.config.ts
# Для GitHub Pages: base: '/repo-name/'
# Для корневого домена: base: '/'
```

### Проблема: 404 на роутах
**Решение:**
Добавьте rewrites в конфигурацию:
```nginx
# Nginx
try_files $uri $uri/ /index.html;
```

### Проблема: Переменные окружения не работают
**Решение:**
```bash
# Переменные должны начинаться с VITE_
# Пересоберите проект после изменения .env
npm run build
```

---

## 📚 Дополнительные ресурсы

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Docker Documentation](https://docs.docker.com/)

---

<div align="center">

**Успешного деплоя! 🚀**

[⬆ Наверх](#-руководство-по-развертыванию)

</div>
