namespace todo_app_backend.Application.Auth.Common.Models;

public sealed record GoogleLoginResponse(string UserId, string Email, string UserName);