namespace todo_app_backend.Application.Common.Interfaces;

using todo_app_backend.Application.Auth.Common.Models;

public interface IGoogleAuthService
{
    string BuildAuthorizationUrl(string state);

    Task<GoogleTokenResponse?> ExchangeCodeForTokenAsync(
        string code,
        CancellationToken cancellationToken);

    Task<GoogleUserInfoResponse?> GetUserInfoAsync(
        string accessToken,
        CancellationToken cancellationToken);
}