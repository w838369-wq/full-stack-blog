# Full Stack Blog Project

This repository contains a full-stack blog application (frontend + backend). The frontend is a React app built with Vite. The backend is an Express API using MongoDB. Authentication is powered by Clerk and images are handled via ImageKit.

## Overview

- Frontend: `client/` (React + Vite, Clerk, ImageKit)
- Backend: `backend/` (Express, Mongoose, ImageKit SDK, Clerk webhooks)

## Requirements

- Node.js (16+ recommended)
- npm or yarn
- MongoDB (local or hosted)
- Clerk account (for authentication) — publishable key & webhook secret
- ImageKit account (for image uploads)

## Quick start (development)

1. Clone the repository and open the project root.
2. Start the backend:

```bash
cd backend
npm install
# set environment variables (see below) or create a .env
node index.js
```

3. Start the frontend:

```bash
cd ../client
npm install
# create a client/.env with VITE_* variables (see below)
npm run dev
```

Open the frontend in your browser (Vite default: `http://localhost:5173`) and the backend runs at `http://localhost:3000` by default.

## Environment variables

Backend (`backend/.env`)

- `MONGO` — MongoDB connection string (e.g. `mongodb://localhost:27017/lama-blog`)
- `CLIENT_URL` — frontend origin (e.g. `http://localhost:5173`) used for CORS
- `IK_PUBLIC_KEY` — ImageKit public key (optional for server logging)
- `IK_PRIVATE_KEY` — ImageKit private key (used to sign upload auth)
- `IK_URL_ENDPOINT` — ImageKit urlEndpoint (e.g. `https://ik.imagekit.io/your_id`)
- `IMAGEKIT_PUBLIC_KEY` — (optional duplicate key if used elsewhere)
- `CLERK_WEBHOOK_SECRET` — Clerk webhook secret used to verify webhook events
- `PORT` — (optional) backend port (defaults to 3000)

Frontend (`client/.env`)

- `VITE_API_URL` — URL of the backend API (e.g. `http://localhost:3000`)
- `VITE_CLERK_PUBLISHABLE_KEY` — Clerk publishable key (client-side)
- `VITE_IK_PUBLIC_KEY` — ImageKit public key (for upload widget)
- `VITE_IK_URL_ENDPOINT` — ImageKit urlEndpoint (for serving images)

Security note: Never store private keys (ImageKit private key, database connection string, Clerk webhook secret) in the frontend or commit them to version control.

## Project structure

- backend/
	- index.js — Express server entry
	- controllers/ — request handlers (posts, users, comments, webhook)
	- models/ — Mongoose models (User, Post, Comment)
	- routes/ — Express routers
	- lib/connectDB.js — MongoDB connection helper
- client/
	- src/ — React source files
	- public/ — static assets
	- package.json — scripts and dependencies

## API reference (concise)

Base URL: `{{VITE_API_URL}}` (default `http://localhost:3000`)

Posts

- GET `/posts` — list posts (supports query params: `page`, `limit`, `cat`, `author`, `search`, `sort`, `featured`)
- GET `/posts/:slug` — get a single post by slug (visit counter middleware runs)
- POST `/posts` — create a post (requires Clerk-authenticated user; body contains post fields)
- DELETE `/posts/:id` — delete a post (owner or admin)
- PATCH `/posts/feature` — toggle isFeatured (admin only)
- GET `/posts/upload-auth` — get ImageKit upload authentication parameters for the client

Users

- GET `/users/saved` — get user saved posts (requires Clerk-auth)
- PATCH `/users/save` — toggle save/unsave a post for the current user (body: `{ postId }`)

Comments

- GET `/comments/:postId` — get comments for a post
- POST `/comments/:postId` — add a comment (requires Clerk-auth; body: `{ text }` or comment object)
- DELETE `/comments/:id` — delete a comment (owner or admin)

Webhooks

- POST `/webhooks/clerk` — Clerk webhook endpoint (expects raw JSON body; verified with `CLERK_WEBHOOK_SECRET`)

Lightweight full-stack blog demo (React + Vite, Express, MongoDB, Clerk, ImageKit).

## Summary

Single-repo demo showing a layered REST architecture with authentication and image uploads:
- Frontend: React (Vite) — UI, Clerk auth, ImageKit client, axios
- Backend: Node.js + Express — REST API, Clerk middleware, ImageKit server-side auth
- Database: MongoDB (Mongoose)

## Key features

- User sign-up / sign-in (Clerk)
- Create, edit, delete posts with slug generation
- Post listing with pagination, filtering, sorting, featured flag
- Comments (CRUD) on posts
- Image uploads via ImageKit (secure server-side auth)
- User saved posts (bookmarking)

## Repo layout

- backend/ — Express API
	- index.js
	- controllers/
	- routes/
	- models/
	- lib/
- client/ — React + Vite frontend
	- src/
	- public/

## Requirements

- Node.js 16+
- npm (or yarn)
- MongoDB (local or hosted)

## Quick start (macOS)

Backend

1. cd backend
2. npm install
3. Create a `.env` file (see Environment variables section)
4. Start server:

```bash
node index.js
```

Frontend

1. cd client
2. npm install
3. Create `client/.env` (copy `client/.env.example` and fill values)
4. Start dev server:

```bash
npm run dev
```

Open frontend at `http://localhost:5173` (Vite default). Backend default port is `3000` unless overridden.

## Environment variables

backend/.env (example)

- `PORT=3000`
- `MONGO=mongodb://localhost:27017/full_stack_blog`
- `CLIENT_URL=http://localhost:5173` (CORS)
- `IK_PUBLIC_KEY` (ImageKit public key — for reference)
- `IK_PRIVATE_KEY` (ImageKit private key — keep secret)
- `IK_URL_ENDPOINT` (ImageKit url endpoint)
- `CLERK_WEBHOOK_SECRET` or `CLERK_SECRET_KEY` (webhook verification)

client/.env (Vite variables)

- `VITE_API_URL=http://localhost:3000`
- `VITE_CLERK_PUBLISHABLE_KEY` (required)
- `VITE_IK_PUBLIC_KEY`
- `VITE_IK_URL_ENDPOINT`

## Important REST endpoints (summary)

Base: `{{VITE_API_URL}}`

- GET `/posts` — list posts (query: `page`, `limit`, `cat`, `author`, `search`, `sort`, `featured`)
- GET `/posts/:slug` — get a single post
- POST `/posts` — create post (Clerk auth required)
- DELETE `/posts/:id` — delete post (owner or admin)
- PATCH `/posts/feature` — toggle featured (admin)
- GET `/posts/upload-auth` — get ImageKit upload auth (server signs)

- GET `/users/saved` — get current user's saved posts (auth)
- PATCH `/users/save` — toggle save/unsave post (auth, body: `{ postId }`)

- GET `/comments/:postId` — list comments for a post
- POST `/comments/:postId` — add comment (auth)
- DELETE `/comments/:id` — delete comment (owner or admin)

- POST `/webhooks/clerk` — Clerk webhook (Svix or secret-key verification)

Protected routes require the Clerk session (server uses `@clerk/express` middleware).

## Data model summary

- User: `{ clerkUserId, username, email, img, savedPosts[] }`
- Post: `{ user(ref), title, slug, content, category, isFeatured, visit, createdAt }`
- Comment: `{ user(ref), post(ref), text, createdAt }`

Index posts by `{ createdAt }` and `{ visit }` for sorting and paging.

## Security & scalability notes

- Do not expose secret keys to the frontend. ImageKit private key and Mongo URI must remain server-side.
- Webhook verification uses Svix signatures when available; a secret-key fallback is implemented for simpler setups.
- Presence or in-memory counters are not clustered-safe. Use Redis or another shared store for multi-instance deployments.

## Development tips

- Use `nodemon` for backend during development.
- If front or backend env vars change, restart the corresponding dev server.
- To debug a blank page, check the browser console and Vite terminal for runtime errors (missing `VITE_CLERK_PUBLISHABLE_KEY` will throw in `src/main.jsx`).

## Optional improvements

- Add `client/.env.example` and `backend/.env.example` (client one is already present)
- Add a root `dev` script to run frontend + backend concurrently (via `concurrently`)
- Add tests and CI for backend routes

---

If you'd like, I can add `backend/.env.example` and a root `dev` script now. Tell me which (npm-based concurrently script or a `docker-compose.yml`) you prefer.

