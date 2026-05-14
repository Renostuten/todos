# Build React frontend
FROM node:24 AS frontend-build
WORKDIR /frontend

COPY todo-app-frontend/package*.json ./
RUN npm install

COPY todo-app-frontend/ ./
RUN npm run build


# Build .NET backend
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build
WORKDIR /src

COPY todo-app-backend/ ./todo-app-backend/

# web.csproj path
RUN dotnet restore ./todo-app-backend/src/Web/Web.csproj

# Copy frontend build into backend wwwroot
RUN mkdir -p ./todo-app-backend/src/Web/wwwroot
COPY --from=frontend-build /frontend/dist ./todo-app-backend/src/Web/wwwroot

RUN dotnet publish ./todo-app-backend/src/Web/Web.csproj \
    -c Release \
    -o /app/publish \
    --no-restore


# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

COPY --from=backend-build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

# Adjust if your DLL name is different
ENTRYPOINT ["dotnet", "todo_app_backend.Web.dll"]