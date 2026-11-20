# UniFlow — University Management System

UniFlow is a full-stack university management platform designed to simplify and organize academic processes within a university.

The platform provides separate workspaces for administrators, professors, and students, allowing each user to access the functionality relevant to their role.

## Overview

UniFlow aims to bring essential university activities into one centralized platform. It provides tools for managing users, courses, enrollments, assignments, class schedules, academic materials, and student submissions.

## User Roles and Features

### Administrator

- Manage users, including students, professors, and administrators.
- Create, update, and delete courses.
- Manage student enrollments.
- Manage assignments and class sessions.
- Manage educational materials.
- View an overview of university platform statistics.

### Professor

- View assigned courses.
- Manage course assignments.
- Create and manage class sessions.
- Upload and manage educational materials.
- View students enrolled in courses.
- Access student submissions and academic information.

### Student

- Access a personal dashboard.
- View enrolled courses.
- View assignments and their details.
- Access class schedules.
- View educational materials.
- Access academic information.

## Technology Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16 |
| Frontend library | React 19 |
| Programming language | TypeScript |
| Styling | Tailwind CSS 4 |
| State management | Zustand 5 |
| Database | MySQL 8 |
| Database driver | mysql2 |
| Authentication | JWT with jose |
| Password hashing | bcryptjs |
| Validation | Zod |
| Form management | React Hook Form |
| Email service | Resend |
| Icons | Lucide React |

## Project Architecture

The project follows a feature-oriented organization using the Next.js App Router.

```text
uniflow/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── admin/
│   │   ├── professor/
│   │   └── student/
│   ├── login/
│   ├── reset-password/
│   └── page.tsx
│
├── components/
│   ├── dashboard/
│   ├── providers/
│   └── ui/
│
├── features/
│   ├── admin/
│   ├── professor/
│   └── student/
│
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   └── permissions.ts
│
├── stores/
│   └── auth-store.ts
│
├── public/
├── package.json
└── README.md
```

### Frontend

The frontend is built with Next.js, React, and TypeScript. Tailwind CSS is used for styling and creating responsive user interfaces.

Zustand manages shared client-side authentication state. Reusable UI components and role-specific feature modules help keep the application organized.

### Backend

The backend is implemented using Next.js Route Handlers.

It provides API endpoints for authentication and role-specific operations. Database access is handled through the `mysql2` library.

Authentication uses JWT tokens signed with `jose`. Passwords are hashed using `bcryptjs`, and session cookies are configured as HTTP-only cookies.

Zod is used for data validation, while Resend provides email functionality for password recovery.

### Database

UniFlow uses MySQL as its relational database.

The main database tables include:

- `users` — user accounts and roles.
- `courses` — university courses.
- `enrollments` — relationships between students and courses.
- `assignments` — course assignments.
- `submissions` — student assignment submissions.
- `class_sessions` — scheduled classes.
- `materials` — educational resources.
- `password_reset_tokens` — password recovery tokens.

## Getting Started

Follow these instructions to run UniFlow locally.

### Prerequisites

- Node.js
- npm
- MySQL 8 or a compatible MySQL server
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Armen209/uniflow.git
cd uniflow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root directory:

```env
APP_URL=http://localhost:3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=uniflow

SESSION_SECRET=your_secure_random_secret

RESEND_API_KEY=your_resend_api_key

NODE_ENV=development
```

Replace the placeholder values with your local configuration.

**Important:** Never commit `.env.local` or expose your database credentials, session secret, or API keys.

### 4. Configure the database

Create a MySQL database named `uniflow` and configure the database connection using the environment variables above.

Ensure that the required database tables are created before running the application.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

## Security

UniFlow includes several authentication and security measures:

- Role-based access control.
- HTTP-only session cookies.
- JWT-based authentication.
- Password hashing with bcryptjs.
- Server-side authorization checks.
- Input validation.
- Secure password recovery using time-limited tokens.

## Project Purpose

UniFlow is developed as a university diploma project to demonstrate the design and implementation of a full-stack web application using modern web technologies.

## Author

**Armen Gevorgyan**

GitHub: [@Armen209](https://github.com/Armen209)

Project repository: [github.com/Armen209/uniflow](https://github.com/Armen209/uniflow)