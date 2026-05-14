namespace todo_app_backend.Application.Auth.Common.Models;

public sealed record UserLoginResponse(string UserId, string Email, string UserName);