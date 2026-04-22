namespace todo_app_backend.Application.Auth.Common.Models;

public sealed record CompleteGoogleSignupRequest
{
    public string UserName { get; init; } = string.Empty;
}