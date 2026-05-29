# 🏆 BOTM Hub (Belarusian Osu! Tournament Mafia)

🇬🇧 **English** | [🇷🇺 Русский](#-русский)

**BOTM Hub** is a large-scale Single Page Application (SPA) for the Belarusian osu! community. The application is designed for managing local tournaments, tracking rosters, maintaining club statistics, and automatically parsing tournament results (ScoreV2).

## 🚀 Tech Stack

- **Framework:** Vue 3 (Composition API, `<script setup>`)
- **Bundler:** Vite
- **State Manager:** Pinia
- **Routing:** Vue Router
- **Database & Auth:** Firebase (Firestore, Firebase Auth)
- **UI Library:** Vuetify 3
- **Languages & Styles:** TypeScript, SCSS (BEM methodology)

## 📁 Project Structure

The project has a modular architecture for easy scalability:

- `src/assets/` — fonts, icons, static images.
- `src/components/` — reusable Vue components grouped by domains (ui, users, osumaps, clubs, etc.).
- `src/composables/` — composable functions (e.g., `useToast`).
- `src/constants/` — global constants and configurations (club settings, mod flags).
- `src/pages/` — page components mapped to routes.
- `src/plugins/` — application plugins (e.g., Vuetify configuration).
- `src/router/` — router configuration and navigation guards.
- `src/services/` — application services (e.g., firebase functions).
- `src/stores/` — Pinia stores (auth, users, osumaps, clubs, etc.).
- `src/styles/` — global styles, variables, templates, mixins.
- `src/types/` — strict TypeScript interfaces and data types.
- `src/utils/` — utility functions and parsers (including a custom binary `.osr` file parser).

## 🛠 Installation and Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Shist/botm-hub.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create an `.env` file in the root directory and add your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_STORAGE_BUCKET=your_storage_bucket
   VITE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_APP_ID=your_app_id
   VITE_MEASUREMENT_ID=your_measurement_id
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

---

## 🇷🇺 Русский

**BOTM Hub** — это масштабное Single Page Application (SPA) для белорусского osu! комьюнити. Приложение предназначено для управления локальными турнирами, отслеживания ростеров, ведения статистики клубов и автоматического парсинга турнирных результатов (ScoreV2).

## 🚀 Технологический стек

- **Фреймворк:** Vue 3 (Composition API, `<script setup>`)
- **Сборщик:** Vite
- **Стейт-менеджер:** Pinia
- **Роутинг:** Vue Router
- **База данных и Авторизация:** Firebase (Firestore, Firebase Auth)
- **UI-библиотека:** Vuetify 3
- **Языки и стили:** TypeScript, SCSS (БЭМ методология)

## 📁 Структура проекта

Проект имеет модульную архитектуру для удобства масштабирования:

- `src/assets/` — шрифты, иконки, статичные картинки
- `src/components/` — переиспользуемые Vue-компоненты, разбитые по доменным зонам (ui, users, osumaps, clubs, etc.).
- `src/composables/` — композитные функции (например, `useToast`).
- `src/constants/` — глобальные константы и конфигурации (настройки клубов, флаги модов).
- `src/pages/` — компоненты-страницы, привязанные к роутам.
- `src/plugins/` — плагины приложения (например, конфигурация Vuetify).
- `src/router/` — конфигурация маршрутизации и навигационные гарды.
- `src/services/` — сервисы приложения (в частности, firebase функции)
- `src/stores/` — хранилища Pinia (auth, users, osumaps, clubs, etc.).
- `src/styles/` — глобальные стили, переменные, шаблоны, миксины.
- `src/types/` — строгие TypeScript-интерфейсы и типы данных.
- `src/utils/` — вспомогательные функции и парсеры (включая самописный парсер бинарных `.osr` файлов).

## 🛠 Установка и запуск на локальном порте

1. Склонируйте репозиторий:
   ```bash
   git clone https://github.com/Shist/botm-hub.git
   ```
2. Установите зависимости:
   ```bash
   npm install
   ```
3. Создайте файл `.env` в корне проекта и добавьте ключи Firebase:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_STORAGE_BUCKET=your_storage_bucket
   VITE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_APP_ID=your_app_id
   VITE_MEASUREMENT_ID=your_measurement_id
   ```
4. Запустите сервер разработки:
   ```bash
   npm run dev
   ```
