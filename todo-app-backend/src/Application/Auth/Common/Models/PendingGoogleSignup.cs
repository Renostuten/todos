namespace todo_app_backend.Application.Auth.Common.Models;

public sealed record PendingGoogleSignup
{
    public string Subject { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
}