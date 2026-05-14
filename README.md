# Todo App

A full-stack todo application with Microsoft Entra ID authentication through Azure App Service Easy Auth, user-scoped todo data, list filtering, and progress visualisation.

The repository contains:

- `todo-app-backend`: an ASP.NET Core backend built with a layered/Clean Architecture style
- `todo-app-frontend`: a React 19 + Vite + TypeScript frontend

## Current Highlights

- Microsoft Entra ID sign-in through Azure App Service Easy Auth
- Backend user lookup from the Easy Auth `X-MS-CLIENT-PRINCIPAL` header
- Session restore on refresh through the backend `/api/auth/me` endpoint
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

The app no longer uses Google OAuth. Authentication is handled by Azure App Service Easy Auth with Microsoft Entra ID.

The current authentication flow is:

1. The login page redirects the browser to `/.auth/login/aad`
2. Azure App Service Easy Auth handles the Microsoft Entra ID sign-in flow
3. Authenticated requests arrive at the backend with the Easy Auth `X-MS-CLIENT-PRINCIPAL` header
4. The backend decodes that header in `GET /api/auth/me` to find the Entra user email and object id
5. If the Entra user does not yet have an application user record, `/api/auth/me` returns `409` with `signup_required`
6. The frontend sends the user to `/signup`, then calls `POST /api/auth/signup` to create the local app user
7. The frontend restores the current session through `GET /api/auth/me`

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
- An Azure App Service with Authentication enabled
- A Microsoft Entra ID app registration configured for the App Service Easy Auth provider

## Local Setup

### 1. Backend configuration

The backend reads configuration from `todo-app-backend/src/Web/appsettings.json` and `appsettings.Development.json`.

At minimum, make sure the following values are correct for your machine:

```json
{
  "ConnectionStrings": {
    "todo-app-backendDb": "DataSource=todo-app-backend.db;Cache=Shared"
  },
  "FrontendOrigin": "http://localhost:5173"
}
```

Notes:

- `FrontendOrigin` must match your frontend dev origin exactly
- The backend currently defaults to `http://localhost:5173` for the frontend if `FrontendOrigin` is missing
- Easy Auth is supplied by Azure App Service, not by the ASP.NET Core app itself
- Local backend requests will not be authenticated unless you run behind an Easy Auth-compatible proxy or supply a valid `X-MS-CLIENT-PRINCIPAL` header for development testing

### 2. Frontend configuration

The frontend currently uses:

- `VITE_API_BASE_URL`

Example `.env` file for `todo-app-frontend`:

```env
VITE_API_BASE_URL=http://localhost:5031/api
```

If `VITE_API_BASE_URL` is not set, the frontend falls back to `http://localhost:5031/api`.

The login page currently redirects to the deployed App Service Easy Auth endpoint:

```text
https://dash-internal-todo-d4hxg2epe9esekc2.australiaeast-01.azurewebsites.net/.auth/login/aad
```

One thing to note here is that this app is intended to only work on the deployed version, therefore if localhost is used, the app will not work.

If you deploy to another App Service, update the login base URL in `todo-app-frontend/src/pages/Login.tsx`.

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

- `POST /api/auth/signup`
- `GET /api/auth/me`

Auth sign-in is initiated outside the API route group through Azure App Service Easy Auth:

- `GET /.auth/login/aad`

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
- Some legacy Google-named types, CSS classes, and dependencies are still present in the repository, but the active sign-in path documented here is Microsoft Entra ID Easy Auth

## Troubleshooting

### Microsoft Entra ID / Easy Auth issues

- Confirm Authentication is enabled on the Azure App Service
- Confirm Microsoft is configured as the App Service authentication provider
- Confirm the login page points at the correct App Service base URL before `/.auth/login/aad`
- Confirm authenticated backend requests include the `X-MS-CLIENT-PRINCIPAL` header
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
