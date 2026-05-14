using Microsoft.AspNetCore.Identity;

namespace todo_app_backend.Infrastructure.Identity;

public class ApplicationUser : IdentityUser
{
    public string? EntraObjectId { get; set; }
    public string? GoogleEmail { get; set; }
}
