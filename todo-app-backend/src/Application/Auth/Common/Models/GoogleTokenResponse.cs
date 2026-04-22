using System.Text.Json.Serialization;

namespace todo_app_backend.Application.Auth.Common.Models;

public sealed record GoogleTokenResponse
{
    [JsonPropertyName("access_token")]
    public string AccessToken { get; init; } = string.Empty;

    [JsonPropertyName("expires_in")]
    public int ExpiresIn { get; init; }

    [JsonPropertyName("token_type")]
    public string TokenType { get; init; } = string.Empty;

    [JsonPropertyName("scope")]
    public string Scope { get; init; } = string.Empty;

    [JsonPropertyName("id_token")]
    public string IdToken { get; init; } = string.Empty;
}