namespace todo_app_backend.Web.Infrastructure.Authentication;

public interface IOAuthStateService
{
    string CreateState(HttpContext httpContext);
    bool IsValidState(HttpContext httpContext, string state);
    void ClearState(HttpContext httpContext);
}