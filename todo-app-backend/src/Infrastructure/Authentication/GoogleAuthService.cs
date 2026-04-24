using System.Net.Http.Json;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Configuration;
using todo_app_backend.Application.Auth.Common.Models;
using todo_app_backend.Application.Common.Interfaces;

namespace todo_app_backend.Infrastructure.Authentication;

public sealed class GoogleAuthService : IGoogleAuthService
{
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;

    public GoogleAuthService(IConfiguration configuration, HttpClient httpClient)
    {
        _configuration = configuration;
        _httpClient = httpClient;
    }

    public string BuildAuthorizationUrl(string state)
    {
        var clientId = _configuration["Google:ClientId"];
        var redirectUri = _configuration["Google:RedirectUri"];

        if (string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(redirectUri))
        {
            throw new InvalidOperationException("Google OAuth configuration is missing.");
        }

        var queryParams = new Dictionary<string, string?>
        {
            ["client_id"] = clientId,
            ["redirect_uri"] = redirectUri,
            ["response_type"] = "code",
            ["scope"] = "openid email",
            ["state"] = state
        };

        return QueryHelpers.AddQueryString(
            "https://accounts.google.com/o/oauth2/v2/auth",
            queryParams);
    }

    public async Task<GoogleTokenResponse?> ExchangeCodeForTokenAsync(
        string code,
        CancellationToken cancellationToken)
    {
        var form = new Dictionary<string, string?>
        {
            ["code"] = code,
            ["client_id"] = _configuration["Google:ClientId"],
            ["client_secret"] = _configuration["Google:ClientSecret"],
            ["redirect_uri"] = _configuration["Google:RedirectUri"],
            ["grant_type"] = "authorization_code"
        };

        using var content = new FormUrlEncodedContent(form);

        var response = await _httpClient.PostAsync(
            "https://oauth2.googleapis.com/token",
            content,
            cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        return await response.Content.ReadFromJsonAsync<GoogleTokenResponse>(
            cancellationToken);
    }

    public async Task<GoogleUserInfoResponse?> GetUserInfoAsync(
        string accessToken,
        CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Get,
            "https://openidconnect.googleapis.com/v1/userinfo");

        request.Headers.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        var response = await _httpClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        return await response.Content.ReadFromJsonAsync<GoogleUserInfoResponse>(
            cancellationToken);
    }
}