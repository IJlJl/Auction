#  Auction  — Real-time Bidding Platform

Це повноцінний Fullstack-проєкт платформи для аукціонів, де користувачі можуть створювати лоти, робити ставки в реальному часі та керувати своїм профілем.

##  Ключові особливості
- **Real-time Bidding:** Оновлення цін відбувається миттєво у всіх користувачів без перезавантаження сторінки (Socket.io).
- **Background Workers:** Автоматичне завершення аукціонів точно в термін за допомогою RabbitMQ та фонових завдань.
- **Security:** Повна система авторизації (JWT), захищені роути та безпечне збереження паролів (Bcrypt).
- **Personal Dashboard:** Особистий кабінет користувача з історією його лотів.
- **Modern UI:** Адаптивний дизайн на Tailwind CSS з модальними вікнами та таймерами.

##  Технологічний стек
- **Backend:** NestJS, TypeORM, PostgreSQL.
- **Frontend:** React (Vite), TypeScript, Tailwind CSS.
- **Messaging:** RabbitMQ.
- **Real-time:** Socket.io.
- **DevOps:** Docker, Docker Compose.

##  Як запустити проєкт
1. Клонуйте репозиторій.
2. Створіть файл `.env` на основі `.env.example` у корені проєкту.
3. Запустіть інфраструктуру:
   ```bash
   docker-compose up -d
   Встановіть залежності та запустіть сервіси:

    Backend: cd Backend && npm install && npm run start:dev

    Frontend: cd Frontend && npm install && npm run dev

    