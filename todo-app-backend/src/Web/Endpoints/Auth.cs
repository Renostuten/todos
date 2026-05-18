using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using todo_app_backend.Infrastructure.Identity;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using todo_app_backend.Application.Auth.Common.Models;
using todo_app_backend.Application.Common.Interfaces;
using todo_app_backend.Web.Infrastructure.Authentication;
using System.Text;
using System.Text.Json;

namespace todo_app_backend.Web.Endpoints;

public class Auth : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapPost(CompleteSignup, "signup");
        groupBuilder.MapGet(GetCurrentUser, "me");
    }

    public static async Task<IResult> CompleteSignup(
        HttpContext httpContext,
        UserManager<ApplicationUser> userManager
    )
    {
        var principal = GetEasyAuthPrincipal(httpContext);

        if (principal is null)
        {
            return TypedResults.Unauthorized();
        }

        var email = principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;

        var entraObjectId = principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(entraObjectId))
        {
            return TypedResults.Unauthorized();
        }

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            EntraObjectId = entraObjectId
        };

        var result = await userManager.CreateAsync(user);

        if (!result.Succeeded)
        {
            return TypedResults.BadRequest();
        }

        return TypedResults.Ok(new UserLoginResponse(
            user.Id,
            user.Email ?? string.Empty,
            user.UserName ?? string.Empty));
    }

    public static async Task<IResult> GetCurrentUser(
        UserManager<ApplicationUser> userManager,
        HttpContext httpContext)
    {
        var principal = GetEasyAuthPrincipal(httpContext);

        if (principal is null)
        {
            return TypedResults.Unauthorized();
        }

        var email = principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;

        var entraObjectId = principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(entraObjectId))
        {
            return TypedResults.Unauthorized();
        }

        var currentUser = await userManager.Users.FirstOrDefaultAsync(u =>
            u.Id == entraObjectId);

        if (currentUser is null)
        {
            return TypedResults.Json(
                new
                {
                    error = "signup_required",
                    email
                },
                statusCode: StatusCodes.Status409Conflict
            );
        }
        
        return TypedResults.Ok(new UserLoginResponse(
            currentUser.Id,
            currentUser.Email ?? string.Empty,
            currentUser.UserName ?? string.Empty));
    }

    private static ClaimsPrincipal? GetEasyAuthPrincipal(HttpContext httpContext)
    {
        if (!httpContext.Request.Headers.TryGetValue("X-MS-CLIENT-PRINCIPAL", out var header))
        {
            return null;
        }

        var principalJson = Encoding.UTF8.GetString(Convert.FromBase64String(header.ToString()));

        var easyAuthPrincipal = JsonSerializer.Deserialize<EasyAuthPrincipal>(principalJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        if (easyAuthPrincipal?.Claims is null)
        {
            return null;
        }

        var claims = easyAuthPrincipal.Claims.Select(c => new Claim(c.Type, c.Value));
        var identity = new ClaimsIdentity(claims, "EasyAuth");

        return new ClaimsPrincipal(identity);
    }

    private sealed class EasyAuthPrincipal
    {
        public string? AuthTyp { get; set; }
        public string? NameTyp { get; set; }
        public string? RoleTyp { get; set; }
        public List<EasyAuthClaim>? Claims { get; set; }
    }

    private sealed class EasyAuthClaim
    {
        public string Type { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
    }
}
