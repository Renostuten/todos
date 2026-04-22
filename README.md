# Todo App

A full-stack todo application with Google sign-in, cookie-based sessions, user-scoped todo data, list filtering, and progress visualisation.

The repository contains:

- `todo-app-backend`: an ASP.NET Core backend built with a layered/Clean Architecture style
- `todo-app-frontend`: a React 19 + Vite + TypeScript frontend

## Current Highlights

- Google OAuth login using a backend-driven redirect flow
- Cookie-based authentication with session restore on refresh
- User-specific todo lists and todo items
- Todo list colours, due dates, and list editing
- Todo item completion, priority, and notes
- Frontend filtering by title, colour, due date, priority, and item count
- Charting with Recharts for list colours and completion status
- TypeScript frontend with split API service modules

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite 8
- React Router 7
- Recharts 3
- ESLint 9
- TailwindCSS 4 tooling is installed in the frontend toolchain

### Backend

- .NET SDK 10.0.201
- ASP.NET Core
- Entity Framework Core
- SQLite
- ASP.NET Identity
- Scalar / OpenAPI

## Project Structure

```text
todo-app/
|-- todo-app-backend/
|   |-- src/
|   |   |-- AppHost/
|   |   |-- Application/
|   |   |-- Domain/
|   |   |-- Infrastructure/
|   |   |-- ServiceDefaults/
|   |   |-- Shared/
|   |   `-- Web/
|   |-- tests/
|   |-- global.json
|   `-- todo-app-backend.slnx
|-- todo-app-frontend/
|   |-- src/
|   |   |-- assets/
|   |   |-- components/
|   |   |-- context/
|   |   |-- hooks/
|   |   |-- pages/
|   |   |-- services/
|   |   |   |-- authApi.ts
|   |   |   |-- http.ts
|   |   |   |-- todoItemsApi.ts
|   |   |   `-- todoListsApi.ts
|   |   `-- types/
|   |-- package.json
|   |-- tsconfig.json
|   `-- vite.config.ts
`-- README.md
```

## Authentication Flow

The app no longer uses the older frontend token-post approach.

The current authentication flow is:

1. The frontend sends the user to `GET /api/auth/google/start`
2. The backend redirects to Google OAuth
3. Google redirects back to `GET /api/auth/google/callback`
4. The backend signs the user in with ASP.NET Identity cookies
5. New users are redirected to `/signup` to complete username setup
6. The frontend restores the current session through `GET /api/auth/me`

## Core Frontend Architecture

The frontend is now fully TypeScript-based.

- App entrypoints:
  - `src/main.tsx`
  - `src/App.tsx`
- Auth state:
  - `src/context/AuthContext.tsx`
- Todo data state:
  - `src/context/TodoContext.tsx`
- Filtering logic:
  - `src/hooks/useTodoFilters.ts`
- API services:
  - `src/services/authApi.ts`
  - `src/services/todoListsApi.ts`
  - `src/services/todoItemsApi.ts`
  - `src/services/http.ts`
- Shared types:
  - `src/types/`

## Core Backend Architecture

The backend follows a layered structure:

- `Domain`: core entities and business rules
- `Application`: commands, queries, DTOs, and business workflows
- `Infrastructure`: persistence, identity, and external integrations
- `Web`: HTTP pipeline, endpoint groups, OpenAPI, and host configuration

The backend initialises the SQLite database automatically in development in `src/Web/Program.cs`.

## Prerequisites

- .NET SDK `10.0.201`
- Node.js 18+ and npm
- A Google Cloud OAuth client

## Local Setup

### 1. Backend configuration

The backend reads configuration from `todo-app-backend/src/Web/appsettings.json` and `appsettings.Development.json`.

At minimum, make sure the following values are correct for your machine and OAuth setup:

```json
{
  "ConnectionStrings": {
    "todo-app-backendDb": "DataSource=todo-app-backend.db;Cache=Shared"
  },
  "Google": {
    "ClientId": "your-google-client-id",
    "RedirectUri": "http://localhost:5031/api/auth/google/callback"
  },
  "FrontendOrigin": "http://localhost:5173",
  "FrontendSignupUrl": "http://localhost:5173/signup"
}
```

Notes:

- `FrontendOrigin` must match your frontend dev origin exactly
- `Google:RedirectUri` must match the callback URL configured in Google Cloud
- The backend currently defaults to `http://localhost:5173` for the frontend if `FrontendOrigin` is missing

### 2. Frontend configuration

The frontend currently uses:

- `VITE_API_BASE_URL`

Example `.env` file for `todo-app-frontend`:

```env
VITE_API_BASE_URL=http://localhost:5031/api
```

If `VITE_API_BASE_URL` is not set, the frontend falls back to `http://localhost:5031/api`.

## Running the App

### Backend

From the repo root:

```bash
cd todo-app-backend/src/Web
dotnet run
```

Expected local backend URL:

- `http://localhost:5031`

Useful backend URLs:

- OpenAPI document: `http://localhost:5031/openapi/v1.json`
- Scalar UI: `http://localhost:5031/scalar`

### Frontend

From the repo root:

```bash
cd todo-app-frontend
npm install
npm run dev
```

Expected local frontend URL:

- `http://localhost:5173`

## API Endpoints

These are the main endpoint groups reflected in the current codebase.

### Auth

- `GET /api/auth/google/start`
- `GET /api/auth/google/callback`
- `POST /api/auth/signup`
- `GET /api/auth/me`

### Users

- `POST /api/users/logout`

Note:

- The frontend currently posts to `/Users/logout`. ASP.NET routing on this app is not case-sensitive on Windows, but using lowercase `/users/logout` is the cleaner canonical form to document.

### Todo Lists

- `GET /api/todolists`
- `GET /api/todolists/{id}`
- `POST /api/todolists`
- `PUT /api/todolists/{id}`
- `DELETE /api/todolists/{id}`

### Todo Items

- `POST /api/todoitems`
- `PUT /api/todoitems/{id}`
- `PATCH /api/todoitems/toggle/{id}`
- `PATCH /api/todoitems/updatedetail/{id}`
- `DELETE /api/todoitems/{id}`

## Frontend Commands

```bash
cd todo-app-frontend
npm run dev
npm run lint
npm run build
npm run preview
```

## Backend Commands

### Run web app

```bash
cd todo-app-backend/src/Web
dotnet run
```

### Build solution

```bash
cd todo-app-backend
dotnet build todo-app-backend.slnx
```

### Run tests

```bash
cd todo-app-backend
dotnet test todo-app-backend.slnx
```

Current backend test projects include:

- `Application.FunctionalTests`
- `Application.UnitTests`
- `Domain.UnitTests`
- `Infrastructure.IntegrationTests`
- `Web.AcceptanceTests`

## Build Outputs

### Frontend

```bash
cd todo-app-frontend
npm run build
```

Build output is written to:

- `todo-app-frontend/dist/`

### Backend

```bash
cd todo-app-backend/src/Web
dotnet publish -c Release -o ./publish
```

## Notes on the Current Codebase

- The frontend has already been migrated from JSX to TSX/TypeScript
- The old single `src/services/api.ts` service layer has been split into endpoint-focused modules
- The frontend uses React context for auth and todo data state
- Chart rendering is implemented with Recharts in `src/components/Chart.tsx`
- The backend serves static files and maps a fallback to `index.html`

## Troubleshooting

### Google OAuth issues

- Confirm the Google OAuth client has the correct authorised redirect URI:
  - `http://localhost:5031/api/auth/google/callback`
- Confirm the frontend origin is allowed in your backend config:
  - `FrontendOrigin=http://localhost:5173`
- Confirm the frontend is pointing at the correct backend:
  - `VITE_API_BASE_URL=http://localhost:5031/api`

### Session issues

- If login succeeds but the app still appears signed out, check cookie handling in the browser
- Make sure frontend and backend URLs match the configured local origins

### Database issues

- In development, the SQLite database is initialised automatically
- If you need a clean slate, remove the local SQLite database file and rerun the backend

### Frontend issues

- If lint passes but build fails inside a restricted shell, rerun the build outside the sandbox or in your normal terminal
- If API requests fail, check `VITE_API_BASE_URL` first

## Repository Status

This root README is intended to describe the current repository layout and runtime behavior.

Subprojects may still contain older README content that describes earlier iterations of the app, so prefer this file when you want the current top-level overview.
