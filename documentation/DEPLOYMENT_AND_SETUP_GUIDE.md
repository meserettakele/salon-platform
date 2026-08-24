# 🚀 Deployment, Configuration & Installation Guide

> Step-by-step setup guide for local development, environment configuration, database provisioning, and production deployment.

---

## 1. System Prerequisites

Ensure the following runtimes and tools are installed on your host machine:

| Component | Minimum Version | Recommended Version |
| :--- | :--- | :--- |
| **Node.js** | `v18.x` | `v20.x LTS` |
| **npm** | `v9.x` | `v10.x` |
| **MySQL Server** | `v8.0` | `v8.0.35+` |
| **Git** | `v2.30+` | `v2.40+` |

---

## 2. Quick Start (Local Development)

### Step 1: Clone Repository
```bash
git clone https://github.com/meserettakele/salon-platform.git
cd salon-platform
```

---

### Step 2: Database Creation
Open MySQL CLI or MySQL Workbench:
```sql
CREATE DATABASE salon_platform_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

### Step 3: Backend Setup & Environment Configuration

Navigate to the `backend` folder and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
# Application Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database Connection (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=salon_platform_db
DB_USER=root
DB_PASSWORD=your_mysql_password

# Authentication & Security
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_EXPIRES_IN=7d

# Chapa Payment Gateway (Ethiopian Birr - ETB)
CHAPA_SECRET_KEY=CHASECK_TEST-xxxxxxxxxxxxxxxxxxxx
CHAPA_PUBLIC_KEY=CHAPUBK_TEST-xxxxxxxxxxxxxxxxxxxx
CHAPA_BASE_URL=https://api.chapa.co/v1
CHAPA_WEBHOOK_SECRET=your_chapa_webhook_secret

# Telegram Bot Integration
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ
TELEGRAM_BOT_USERNAME=SalonPlatformBot

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Upload Directory
UPLOAD_DIR=public/uploads
```

Run seeders / initialization (if applicable):
```bash
# Start backend in development mode with live reload:
npm run dev
# OR for standard start:
npm start
```

---

### Step 4: Frontend Setup & Environment Configuration

Open a new terminal, navigate to the `frontend` folder, and install packages:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_STORAGE_BASE_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
VITE_TELEGRAM_BOT_USERNAME=SalonPlatformBot
```

Start the Vite development server:
```bash
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 3. Third-Party Integration Setup

### 3.1 Chapa Payment Gateway
1. Register an account at [Chapa](https://chapa.co).
2. Go to **Settings > API & Webhooks**.
3. Copy your `Test Secret Key` and `Test Public Key` into `backend/.env`.
4. Set the Return URL in code: `http://localhost:5000/api/payments/chapa/verify`.

### 3.2 Telegram Bot Setup
1. Open Telegram and search for `@BotFather`.
2. Send `/newbot`, name your bot (e.g. `MySalonPlatformBot`), and choose a unique username ending with `bot`.
3. Copy the HTTP API token provided by BotFather into `TELEGRAM_BOT_TOKEN` in `backend/.env`.
4. Users can now link their accounts and receive instant push updates!

### 3.3 Google OAuth Authentication
1. Go to [Google Cloud Console](https://console.cloud.google.com).
2. Create a new project and configure the OAuth Consent Screen.
3. Under **Credentials**, create an **OAuth 2.0 Client ID** (Web application).
4. Add Authorized JavaScript origins: `http://localhost:5173`.
5. Add Authorized redirect URIs: `http://localhost:5173`.
6. Copy the Client ID into both `frontend/.env` and `backend/.env`.

---

## 4. Production Deployment Guidelines

### 4.1 Production Build
```bash
# Inside frontend/
npm run build
# The optimized production build is generated in frontend/dist
```

### 4.2 Process Management with PM2
```bash
npm install -g pm2
cd backend
pm2 start server.js --name "salon-backend"
pm2 save
pm2 startup
```

### 4.3 Nginx Reverse Proxy Sample Config
```nginx
server {
    listen 80;
    server_name yoursalonplatform.com;

    # Frontend SPA
    location / {
        root /var/www/salon-platform/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API & Uploads
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        alias /var/www/salon-platform/backend/public/uploads;
    }
}
```
