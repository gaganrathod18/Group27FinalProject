# My Courses App

A full-stack course management application with role-based access for faculty and students. Faculty members can create and manage courses, while students can browse and enroll in courses.

## Features

- **Faculty Features**
  - Create, edit, and delete their own courses
  - Manage course enrollment status (Open, Closed, Waitlist)
  - View all courses they've created

- **Student Features**
  - Browse all available courses
  - Enroll in multiple courses (limited to courses with "Open" status)
  - View current enrollments
  - Unenroll from courses
  - Filter courses by semester.

- **Authentication**
  - Separate registration and login for Faculty and Students
  - JWT token-based authentication
  - Role-based access control

- **Modern UI**
  - Material UI components
  - Responsive design
  - Role-specific dashboards
  - Tab-based navigation for students

## Architecture

- `backend/` - Express.js + MongoDB API
- `frontend/` - React + Vite UI

## Database Models

### User
- username (unique)
- passwordHash
- role (faculty/student)
- timestamps

### Course
- title
- details
- semester
- enrollStatus (Open, Closed, Waitlist)
- faculty (reference to User)
- timestamps

### Enrollment
- student (reference to User)
- course (reference to Course)
- timestamps

## Backend Setup

### Environment Variables

Copy `backend/.env.example` to `backend/.env`:

```env
PORT=5000
MONGODB_URI=use-your-uri
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
CORS_ORIGIN=http://localhost:5173
GOOGLE_CLIENT_ID=__
```

### Installation & Running

From `backend/`:

```bash
npm install
npm run dev  # development with nodemon
npm start    # production
```

## Frontend Setup

### Environment Variables

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
GOOGLE_CLIENT_ID=__
```

### Installation & Running

From `frontend/`:

```bash
npm install
npm run dev  # Vite dev server (http://localhost:5173)
npm run build
npm run preview
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register (requires `username`, `password`, `role`)
- `POST /auth/login` - Login (returns JWT token and user info)

### Courses (Both roles)
- `GET /courses` - List all courses
- `GET /course/:id` or `/course?id=...` - Get course details

### Faculty Only
- `POST /course` - Create a course
- `PUT /course/:id` - Update own course
- `DELETE /course/:id` - Delete own course
- `GET /faculty/courses` - Get faculty's courses

### Student Only
- `POST /enroll` - Enroll in a course (requires `courseId`)
- `GET /enrollments` - Get student's enrollments
- `DELETE /enrollment/:enrollmentId` - Unenroll from a course

All protected endpoints require Bearer token in Authorization header:
```
Authorization: Bearer <token>
```

## User Flows

### Faculty Registration & Login
1. Navigate to `/` (Landing Page)
2. Click "Faculty" → Register or Login
3. Access Faculty Dashboard at `/faculty/dashboard`
4. Create, edit, or delete courses
5. View all courses you've created

### Student Registration & Login
1. Navigate to `/` (Landing Page)
2. Click "Student" → Register or Login
3. Access Student Dashboard at `/student/dashboard`
4. **Available Courses Tab**: Browse and enroll in courses
5. **My Enrollments Tab**: View, manage, and unenroll from courses

## 12-Factor App Compliance

This project follows app-level 12-factor principles:

-  **Config in env** - All runtime config via environment variables
-  **Dependencies** - Explicit in package.json  
-  **Stateless processes** - Backend API is stateless, JWT for auth
-  **Logs to stdout** - All logs written to console
-  **Dev/prod parity** - Same start commands and behavior


## Running the Full Stack

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Then open http://localhost:5173 in your browser.

## Demo Data

To add demo courses:
1. Register as faculty
2. Create a few test courses with different semesters and statuses
3. Register as student
4. Browse and enroll in the created courses

