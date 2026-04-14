# Todo App

A full-stack todo application that helps users organize, track, and manage their tasks efficiently. The app features Google OAuth authentication, dynamic task prioritization, and an intuitive interface for managing multiple todo lists.

## Overview

The Todo App is a modern web application built with a clean separation of concerns, featuring a responsive React frontend and a robust ASP.NET Core backend. Users can authenticate via Google, create multiple todo lists, organize tasks with priorities and notes, and track completion status in real-time.

---

## Features

### Authentication & User Management
- **Google OAuth Login**: Secure authentication using Google Identity Services
- **Session Management**: Persistent login sessions with automatic restoration
- **User-Specific Data**: All data is isolated and protected per user

### Todo List Management
- **Create Lists**: Add new todo lists with custom names
- **Color Coding**: Assign colors to lists for visual organization
- **Due Dates**: Set and track due dates for lists
- **Update & Delete**: Edit list titles, colors, and dates; delete lists as needed

### Todo Item Management
- **Create Items**: Add tasks to lists with titles
- **Item Priorities**: Assign priority levels to individual tasks (e.g., High, Medium, Low)
- **Item Notes**: Add detailed notes to tasks for additional context
- **Completion Tracking**: Mark items as done/incomplete with visual indicators
- **Item Details**: Edit item priorities and notes separately from the title
- **Delete Items**: Remove tasks from lists

### User Experience
- **Search Functionality**: Find todo lists quickly with search
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Intuitive Forms**: Easy-to-use interfaces for creating and editing items
- **Real-Time Updates**: Immediate feedback on all user actions

---

## Tech Stack

### Backend
- **Runtime**: .NET 10 (ASP.NET Core)
- **ORM**: Entity Framework Core with SQLite
- **Authentication**: 
  - ASP.NET Identity
  - Google.Apis.Auth for OAuth token validation
- **API Documentation**: Scalar (interactive API explorer)
- **Architecture**: Clean Architecture with layered design (Application, Domain, Infrastructure, Web layers)
- **Testing**: Unit tests, Functional tests, Integration tests, Acceptance tests

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: TailwindCSS 4
- **Authentication**: Google Identity Services (Google Sign-In)
- **HTTP Client**: Fetch API
- **Linting**: ESLint

### Database
- **Primary Database**: SQLite (development and deployment)
- **Migrations**: Entity Framework Core migrations

### Development Tools
- **Source Control**: Git
- **Configuration**: Environment-based (Development, Production)
- **Security**: CORS configuration, HTTPS enforcement (production), OAuth token validation

---

## Project Structure

```
todo-app/
├── todo-app-backend/              # ASP.NET Core backend
│   ├── src/
│   │   ├── AppHost/               # Service host
│   │   ├── Application/           # Business logic & use cases
│   │   ├── Domain/                # Core domain models & rules
│   │   ├── Infrastructure/        # Data access & external services
│   │   ├── ServiceDefaults/       # Shared service configuration
│   │   ├── Shared/                # Shared utilities
│   │   └── Web/                   # API endpoints & configuration
│   ├── tests/                     # Comprehensive test suites
│   └── README.md
│
├── todo-app-frontend/             # React + Vite frontend
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── api.js                 # API client
│   │   ├── App.jsx                # Main app component
│   │   ├── App.css                # Styling
│   │   └── main.jsx               # Entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
└── README.md (this file)
```

---

## Getting Started

### Prerequisites
- **.NET 10 SDK**: [Download](https://dotnet.microsoft.com/download)
- **Node.js** (v18 or higher): [Download](https://nodejs.org/)
- **Google OAuth Credentials**: Set up OAuth 2.0 credentials at [Google Cloud Console](https://console.cloud.google.com/)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd todo-app-backend
   ```

2. Create a `appsettings.Development.json` file in `src/Web/` with your configuration:
   ```json
   {
     "Google:ClientId": "your-google-client-id",
     "FrontendOrigin": "http://localhost:5173"
   }
   ```

3. Initialize the database:
   ```bash
   dotnet run --launch-profile Web
   ```
   The app will automatically initialize the SQLite database on first run.

4. The API will be available at `https://localhost:5031`
   - API Documentation: `https://localhost:5031/scalar/v1`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd todo-app-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Google Client ID:
   ```
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

### Running Both Services
In separate terminals:

**Terminal 1 (Backend)**:
```bash
cd todo-app-backend/src/Web
dotnet run
```

**Terminal 2 (Frontend)**:
```bash
cd todo-app-frontend
npm run dev
```

---

## API Endpoints

### Authentication
- `POST /api/auth/google` - Login with Google credential
- `GET /api/auth/me` - Get current authenticated user
- `POST /api/Users/logout` - Logout current user

### Todo Lists
- `GET /api/TodoLists` - Get all todo lists for current user
- `POST /api/TodoLists` - Create a new todo list
- `PUT /api/TodoLists/{id}` - Update a todo list
- `DELETE /api/TodoLists/{id}` - Delete a todo list

### Todo Items
- `POST /api/TodoItems` - Create a new todo item
- `PUT /api/TodoItems/{id}` - Update a todo item
- `PUT /api/TodoItems/details/{id}` - Update item priority and notes
- `DELETE /api/TodoItems/{id}` - Delete a todo item
- `POST /api/TodoItems/toggle/{id}` - Toggle item completion status

---

## Build & Deployment

### Frontend Build
```bash
cd todo-app-frontend
npm run build
```
Output will be in the `dist/` folder.

### Backend Build
```bash
cd todo-app-backend
dotnet publish -c Release -o ./publish
```

---

## Testing

### Backend Tests
```bash
cd todo-app-backend
dotnet test
```

The project includes:
- Unit Tests (Domain logic)
- Functional Tests (Application services)
- Integration Tests (Infrastructure & database)
- Acceptance Tests (Full user workflows)

### Frontend Linting
```bash
cd todo-app-frontend
npm run lint
```

---

## Environment Configuration

### Backend Environment Variables
- `ASPNETCORE_ENVIRONMENT`: Development/Production
- `Google:ClientId`: Your Google OAuth client ID
- `FrontendOrigin`: Allowed frontend origin for CORS
- `ConnectionStrings:DefaultConnection`: Database connection string

### Frontend Environment Variables
- `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- Backend URL: Configured in `src/api.js`

---

## Development Workflow

1. **Feature Branch**: Create a feature branch from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Backend Changes**: Update Application/Domain/Infrastructure layers as needed

3. **Frontend Changes**: Update React components and API calls

4. **Testing**: Run tests to ensure functionality
   ```bash
   # Backend
   dotnet test
   
   # Frontend
   npm run lint
   ```

5. **Commit**: Commit changes with descriptive messages
   ```bash
   git commit -m "feat: add your feature description"
   ```

---

## Architecture Highlights

### Backend Architecture
- **Domain-Driven Design**: Core domain models in the Domain layer
- **CQRS-Like Pattern**: Separation of commands and queries
- **Dependency Injection**: Centralized service registration
- **Entity Framework Core**: Database abstraction with migrations
- **Endpoint-Based**: Clean, modular API endpoint organization

### Frontend Architecture
- **Component-Based**: Reusable React components
- **State Management**: React hooks (useState, useEffect)
- **API Abstraction**: Centralized API client (`api.js`)
- **Styling**: TailwindCSS utility-first approach
- **Responsive Design**: Mobile-first CSS approach

---

## Known Limitations & Future Enhancements

### Potential Enhancements
- Email notifications for upcoming due dates
- Recurring tasks
- Task categories and tags
- Drag-and-drop prioritization
- Offline support with service workers
- Dark mode
- Multi-language support
- Task collaboration and sharing
- Email notifications
- UI improvements

---

## Troubleshooting

### Backend Issues
- **Database Error**: Delete `todo-app.db` to reset the database
- **CORS Error**: Check `FrontendOrigin` configuration matches your frontend URL
- **Google OAuth Error**: Verify `Google:ClientId` is correct and matches your consent screen configuration

### Frontend Issues
- **API Connection Error**: Ensure backend is running on the expected port
- **OAuth Error**: Verify `VITE_GOOGLE_CLIENT_ID` is correct
- **Port Conflicts**: Change port in `vite.config.js` if 5173 is in use

---

## Contributing

Contributions are welcome! Please follow these guidelines:
1. Create a feature branch
2. Write tests for new features
3. Follow the existing code style
4. Submit a pull request with a clear description

---

## License

This project is private and for development purposes.

---

## Support

For issues or questions, please refer to the existing issue tracker or contact the development team.
