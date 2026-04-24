using System.Security.Cryptography;

namespace todo_app_backend.Web.Infrastructure.Authentication;

public sealed class OAuthStateService : IOAuthStateService
{
    private const string CookieName = "google_oauth_state";

    public string CreateState(HttpContext httpContext)
    {
        var state = GenerateState();

        httpContext.Response.Cookies.Append(
            CookieName,
            state,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Lax,
                Expires = DateTimeOffset.UtcNow.AddMinutes(10)
            });

        return state;
    }

    public bool IsValidState(HttpContext httpContext, string state)
    {
        var storedState = httpContext.Request.Cookies[CookieName];

        return !string.IsNullOrWhiteSpace(storedState)
            && !string.IsNullOrWhiteSpace(state)
            && storedState == state;
    }

    public void ClearState(HttpContext httpContext)
    {
        httpContext.Response.Cookies.Delete(CookieName);
    }

    private static string GenerateState()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);

        return Convert.ToBase64String(bytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");
    }
}