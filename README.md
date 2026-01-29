# Online Bus Booking System

A simple bus booking application with a static frontend and a Node.js + Express backend (MongoDB + JWT + sessions). The frontend lives in the frontend folder and can be opened directly in a browser, while the backend provides authentication and booking APIs.

## Preview

![Home screen](assets/screenshots/home-hero.svg)

## Architecture

![Architecture diagram](assets/diagrams/architecture.svg)

## Features

- User registration and login
- JWT-based auth + session support
- Booking flow (search, seat selection, passenger details, payment)
- Booking management pages
- Static frontend served by the backend

## Project structure

- busbooking-backend/ — Node.js backend (Express + MongoDB)
- frontend/ — HTML/CSS/JS frontend
- first files/ — legacy HTML files (older versions)
- assets/ — README images

## Tech stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB
- Auth: JWT + express-session

## Prerequisites

- Node.js 18+ (recommended)
- MongoDB (local or hosted)

## Backend setup

1. Open a terminal in the repository root.
2. Install dependencies:

   ```bash
   cd busbooking-backend
   npm install
   ```

3. Create a .env file in busbooking-backend (optional, defaults are provided in code):

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/busbooking
   SESSION_SECRET=your-session-secret
   JWT_SECRET=your-jwt-secret
   ```

4. Start the server:

   ```bash
   npm run dev
   ```

The API will be available at http://localhost:5000/api.

## Frontend usage

Option 1 (simple): Open frontend/index.html in a browser.

Option 2 (recommended): Use a static server (VS Code Live Server).

When the backend is running, it also serves the frontend statically from the frontend folder.

## Common API endpoints

- GET /api/health
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me (protected)
- POST /api/auth/forgot-password

## Troubleshooting

- MongoDB connection issues: verify MONGODB_URI and that MongoDB is running.
- CORS errors: ensure the frontend is served from an allowed origin or use the backend static server.

## Notes

- The first files folder contains older HTML versions for reference.
- Default server port is 5000 unless overridden in .env.

## License

ISC
