# My Courses App

A full-stack course management application with role-based access for faculty and students. Faculty can create and manage courses, while students can browse, enroll, and unenroll from courses.

## Tech Stack

- Frontend: React, Vite, Material UI, Google Identity Services
- Backend: Node.js, Express, MongoDB, Mongoose, JWT
- Infrastructure: Docker, Docker Compose, Nginx

## Features

- Faculty registration and login
- Student registration and login
- Google sign-in for faculty and students
- JWT authentication
- Role-based route protection
- Faculty course create, update, delete, and listing
- Student course browsing, enrollment, and unenrollment
- Dockerized frontend, backend, and MongoDB services

## Project Structure

```text
backend/    Express API, MongoDB models, auth, course routes
frontend/   React/Vite UI served by Nginx in Docker
docker-compose.yml
```

## Environment Files

Create these files before running the app.

### `backend/.env`

```env
PORT=5000
MONGODB_URI=mongodb://mongo:27017/vcc_project
JWT_SECRET=change-this-secret
JWT_EXPIRES_IN=1h
CORS_ORIGIN=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
```

For local backend development outside Docker, use a local MongoDB URI instead:

```env
MONGODB_URI=mongodb://localhost:27017/vcc_project
CORS_ORIGIN=http://localhost:5173
```

### `frontend/.env`

```env
VITE_API_BASE_URL=/api
VITE_GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
```

For local Vite development without Docker, use:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Important: `VITE_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_ID` must be the same Google OAuth Web Client ID.

## Run With Docker Compose

From the project root:

```bash
docker compose up --build -d
```

Check service status:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs -f
```

Stop services:

```bash
docker compose down
```

Local Docker URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- Backend health: `http://localhost:5000/health`
- MongoDB: `mongodb://localhost:27017`

In Docker, the frontend calls the backend through Nginx using `/api`, which proxies to `backend:5000`.

## Run Without Docker

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run start
```

Then open:

```text
http://localhost:5173
```

## Google OAuth Setup

Create a Google OAuth Client ID in Google Cloud Console:

1. Go to `APIs & Services` -> `Credentials`
2. Create `OAuth client ID`
3. Choose application type `Web application`
4. Copy the generated Client ID into both `backend/.env` and `frontend/.env`

### Local Authorized JavaScript Origins

Add these for local Docker and local Vite development:

```text
http://localhost:3000
http://127.0.0.1:3000
http://localhost:5173
http://127.0.0.1:5173
```

### Local Authorized Redirect URIs

This app currently uses Google Identity Services ID-token sign-in, so it does not require a custom callback route. If Google Console requires redirect URIs or you see `redirect_uri_mismatch`, add:

```text
http://localhost:3000
http://127.0.0.1:3000
http://localhost:5173
http://127.0.0.1:5173
```

### Cloud Deployment OAuth Changes

When deploying to a real domain, add your production frontend domain to Google OAuth.

Example production frontend:

```text
https://my-courses.example.com
```

Authorized JavaScript origins:

```text
https://my-courses.example.com
```

Authorized redirect URIs:

```text
https://my-courses.example.com
```

If your frontend is hosted on a platform URL such as Vercel, Netlify, Render, Railway, or a custom domain, add the exact browser URL users open. The scheme and host must match exactly, including `https`.

Examples:

```text
https://my-courses.vercel.app
https://my-courses.netlify.app
https://my-courses.example.com
```

Do not add backend API URLs as JavaScript origins unless the browser directly opens the backend domain for Google sign-in.

## CORS Notes For Cloud Deployment

The backend uses `CORS_ORIGIN` to allow browser requests from the frontend.

Local Docker:

```env
CORS_ORIGIN=http://localhost:3000
```

Local Vite:

```env
CORS_ORIGIN=http://localhost:5173
```

Cloud deployment:

```env
CORS_ORIGIN=https://your-frontend-domain.com
```

Examples:

```env
CORS_ORIGIN=https://my-courses.vercel.app
CORS_ORIGIN=https://my-courses.netlify.app
CORS_ORIGIN=https://my-courses.example.com
```

If frontend and backend are deployed on different domains, `CORS_ORIGIN` must be the frontend domain, not the backend domain.

If frontend and backend are served under the same domain through a reverse proxy, for example:

```text
https://my-courses.example.com
https://my-courses.example.com/api
```

then set:

```env
VITE_API_BASE_URL=/api
CORS_ORIGIN=https://my-courses.example.com
```

If the frontend calls a separate backend URL, for example:

```text
Frontend: https://my-courses.example.com
Backend:  https://api.my-courses.example.com
```

then set:

```env
VITE_API_BASE_URL=https://api.my-courses.example.com
CORS_ORIGIN=https://my-courses.example.com
```

## API Endpoints

### Authentication

- `POST /auth/register` - register with `username`, `password`, and `role`
- `POST /auth/login` - login with `username` and `password`
- `POST /auth/google` - login/register using Google ID credential and `role`

### Courses

- `GET /courses` - list all courses
- `GET /course/:id` - get course details
- `GET /course?id=...` - get course details by query parameter

### Faculty Only

- `POST /course` - create a course
- `PUT /course/:id` - update own course
- `DELETE /course/:id` - delete own course
- `GET /faculty/courses` - list faculty-owned courses

### Student Only

- `POST /enroll` - enroll in a course with `courseId`
- `GET /enrollments` - list current student's enrollments
- `DELETE /enrollment/:enrollmentId` - unenroll from a course

Protected endpoints require:

```http
Authorization: Bearer <token>
```

## Common Google OAuth Errors

### `origin_mismatch`

The browser origin is missing from `Authorized JavaScript origins`.

Fix: add the exact URL you use in the browser, such as:

```text
http://localhost:3000
```

### `redirect_uri_mismatch`

The OAuth client is not configured for the redirect/origin Google is using, or the wrong Client ID is being served.

Fix:

- Confirm the OAuth client type is `Web application`
- Confirm the Client ID in `frontend/.env` and `backend/.env` matches Google Console
- Add the local or production frontend URL to `Authorized JavaScript origins`
- Add the same URL to `Authorized redirect URIs` if Google still requires it
- Rebuild the frontend after changing env values:

```bash
docker compose down
docker compose up --build -d
```

### Google button says client ID is missing

Make sure `frontend/.env` contains:

```env
VITE_GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
```

Then rebuild:

```bash
docker compose up --build -d
```

## Database Models

### User

- `username`
- `email`
- `googleId`
- `passwordHash`
- `role`
- `timestamps`

### Course

- `title`
- `details`
- `semester`
- `enrollStatus`
- `faculty`
- `timestamps`

### Enrollment

- `student`
- `course`
- `timestamps`

## Demo Flow

1. Register as faculty
2. Create courses
3. Register as student
4. Browse available courses
5. Enroll and unenroll from courses
