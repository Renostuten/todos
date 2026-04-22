using System.Text.Json.Serialization;

namespace todo_app_backend.Application.Auth.Common.Models;

public sealed record GoogleUserInfoResponse
{
    [JsonPropertyName("sub")]
    public string Subject { get; init; } = string.Empty;

    [JsonPropertyName("email")]
    public string Email { get; init; } = string.Empty;

    [JsonPropertyName("email_verified")]
    public bool EmailVerified { get; init; }

    [JsonPropertyName("name")]
    public string Name { get; init; } = string.Empty;

    [JsonPropertyName("picture")]
    public string Picture { get; init; } = string.Empty;
}