using todo_app_backend.Application.Auth.Common.Models;

namespace todo_app_backend.Web.Infrastructure.Authentication;

public interface IPendingGoogleSignupService
{
    void Store(HttpContext httpContext, PendingGoogleSignup pendingSignup);
    PendingGoogleSignup? Get(HttpContext httpContext);
    void Clear(HttpContext httpContext);
}