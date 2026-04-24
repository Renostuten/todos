using System.Text.Json;
using todo_app_backend.Application.Auth.Common.Models;

namespace todo_app_backend.Web.Infrastructure.Authentication;

public sealed class PendingGoogleSignupService : IPendingGoogleSignupService
{
    private const string CookieName = "pending_google_signup";

    public void Store(HttpContext httpContext, PendingGoogleSignup pendingSignup)
    {
        var pendingSignupJson = JsonSerializer.Serialize(pendingSignup);

        httpContext.Response.Cookies.Append(
            CookieName,
            pendingSignupJson,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Lax,
                Expires = DateTimeOffset.UtcNow.AddMinutes(10)
            });
    }

    public PendingGoogleSignup? Get(HttpContext httpContext)
    {
        var pendingSignupCookie = httpContext.Request.Cookies[CookieName];

        if (string.IsNullOrWhiteSpace(pendingSignupCookie))
        {
            return null;
        }

        try
        {
            return JsonSerializer.Deserialize<PendingGoogleSignup>(pendingSignupCookie);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    public void Clear(HttpContext httpContext)
    {
        httpContext.Response.Cookies.Delete(CookieName);
    }
}