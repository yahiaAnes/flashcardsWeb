# Flashcards Application
## 📌 Project Summary

**NeoFlash** is a full-stack web application built with **React** and **Laravel** that allows users to convert study materials (text or PDFs) into interactive flashcards. The platform focuses on improving learning efficiency through smart flashcard creation, organization, and review, with a modern and responsive user interface.

## Features

- 🔐 **User Authentication**: Secure registration, login, email verification, and password reset
- 📚 **Lesson Management**: Organize flashcards into lessons/categories
- 🎴 **Flashcard CRUD**: Create, read, update, and delete flashcards
- 🤖 **AI-Powered Generation**: Generate flashcards from PDF files or text input
- 📱 **Modern UI**: Responsive design built with React and Tailwind CSS
- 🔒 **Secure API**: Laravel Sanctum authentication with protected routes

## Tech Stack

### Backend
- **Framework**: Laravel 12
- **PHP**: 8.2+
- **Authentication**: Laravel Sanctum
- **Database**: MySQL
- **PDF Processing**: Spatie PDF-to-Text
- **Testing**: Pest PHP

### Frontend
- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **PDF Handling**: PDF.js

## Project Structure

```
flashcards/
├── backend/                 # Laravel API backend
│   ├── app/
│   │   ├── Http/
│   │   │   └── Controllers/
│   │   │       └── Api/     # API controllers
│   │   └── Models/          # Eloquent models
│   ├── database/
│   │   ├── migrations/      # Database migrations
│   │   └── seeders/        # Database seeders
│   ├── routes/
│   │   └── api.php         # API routes
│   └── tests/              # Test suite
│
└── flashcardsFront/         # React frontend
    ├── src/
    │   ├── api/            # API client
    │   ├── components/     # React components
    │   ├── contexts/       # React contexts
    │   ├── hooks/          # Custom hooks
    │   ├── pages/          # Page components
    │   ├── services/       # Service layer
    │   └── store/          # Zustand stores
    └── public/             # Static assets
```

## Prerequisites

- **PHP**: 8.2 or higher
- **Composer**: Latest version
- **Node.js**: 18.x or higher
- **npm** or **yarn**: Package manager
- **Database**: MySQL, PostgreSQL, or SQLite
- **Mail Server**: For email verification (can use Mailtrap for development)

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install PHP dependencies:
```bash
composer install
```

3. Copy the environment file:
```bash
cp .env.example .env
```

4. Generate application key:
```bash
php artisan key:generate
```

5. Configure your `.env` file with database credentials:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=flashcards
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

6. Run migrations:
```bash
php artisan migrate
```

7. (Optional) Seed the database:
```bash
php artisan db:seed
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd flashcardsFront
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (if needed) with your API URL:
```env
VITE_API_URL=http://localhost:8000/api
```

## Running the Application

### Development Mode

#### Backend
From the `backend` directory:
```bash
php artisan serve
```
The API will be available at `http://localhost:8000`

#### Frontend
From the `flashcardsFront` directory:
```bash
npm run dev
```
The frontend will be available at `http://localhost:5173` (or the port Vite assigns)

### Using Composer Scripts (Backend)

The backend includes convenient composer scripts:

```bash
# Setup everything (install dependencies, generate key, migrate, build assets)
composer setup

# Run development server with queue, logs, and vite
composer dev

# Run tests
composer test
```

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user (protected)
- `POST /api/verify-email` - Verify email address
- `POST /api/forgot-password` - Request password reset
- `POST /api/reset-password` - Reset password
- `GET /api/me` - Get current user (protected)

### Lessons
- `POST /api/createLesson` - Create a new lesson (protected)
- `GET /api/lessons` - Get all lessons (protected)
- `GET /api/lessons/{id}/with-flashcards` - Get lesson with flashcards (protected)
- `DELETE /api/lessons/{id}` - Delete a lesson (protected)

### Flashcards
- `GET /api/getFlashcards` - Get flashcards (protected)
- `POST /api/createFlashcards` - Create flashcards (protected)
- `PUT /api/flashcards/{id}` - Update a flashcard (protected)
- `DELETE /api/deleteFlashcard/{id}` - Delete a flashcard (protected)
- `POST /api/flashcards/{id}/rate` - Rate a flashcard (protected)

### AI Generation
- `POST /api/generateFlashcardsAi` - Generate flashcards from PDF (protected)
- `POST /api/generateFlashcardsFromText` - Generate flashcards from text (protected)

## Features in Detail

### Spaced Repetition System
The application implements a spaced repetition algorithm that tracks:
- **Difficulty**: Easy, Medium, or Hard
- **Repetition Count**: Number of times reviewed
- **Last Reviewed**: Timestamp of last review
- **Next Review**: Scheduled next review date

### AI Flashcard Generation
- **From PDF**: Upload a PDF file and automatically extract text to generate flashcards
- **From Text**: Paste or type text content to generate flashcards

## Testing

### Backend Tests
From the `backend` directory:
```bash
php artisan test
# or
composer test
```

### Frontend Tests
(Add testing setup as needed)

## Building for Production

### Backend
No build step required for Laravel backend. Ensure you:
- Set `APP_ENV=production` in `.env`
- Run `php artisan config:cache`
- Run `php artisan route:cache`
- Run `php artisan view:cache`

### Frontend
From the `flashcardsFront` directory:
```bash
npm run build
```
The production build will be in the `dist` directory.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Support

For issues, questions, or contributions, please open an issue on the repository.

