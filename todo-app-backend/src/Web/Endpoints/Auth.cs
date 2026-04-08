using System.Security.Claims;
using Google.Apis.Auth;
using todo_app_backend.Infrastructure.Identity;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace todo_app_backend.Web.Endpoints;

public class Auth : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapPost(GoogleLogin, "google");
        groupBuilder.MapGet(GetCurrentUser, "me").RequireAuthorization();
    }

    public sealed record GoogleLoginRequest(string Credential);
    public sealed record GoogleLoginResponse(string UserId, string Email, string UserName);

    public static async Task<Results<Ok<GoogleLoginResponse>, BadRequest>> GoogleLogin(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IConfiguration configuration,
        [FromBody] GoogleLoginRequest request)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.Credential))
        {
            return TypedResults.BadRequest();
        }

        var clientId = configuration["Authentication:Google:ClientId"];
        var validationSettings = new GoogleJsonWebSignature.ValidationSettings();

        if (!string.IsNullOrWhiteSpace(clientId))
        {
            validationSettings.Audience = [clientId];
        }

        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(request.Credential, validationSettings);
        }
        catch (Exception)
        {
            return TypedResults.BadRequest();
        }

        if (payload is null || string.IsNullOrWhiteSpace(payload.Email))
        {
            return TypedResults.BadRequest();
        }

        var email = payload.Email;
        var user = await userManager.FindByEmailAsync(email);

        if (user is null)
        {
            user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true,
            };

            var createResult = await userManager.CreateAsync(user);
            if (!createResult.Succeeded)
            {
                return TypedResults.BadRequest();
            }
        }

        await signInManager.SignInAsync(user, isPersistent: false);

        return TypedResults.Ok(new GoogleLoginResponse(
            user.Id,
            user.Email ?? string.Empty,
            user.UserName ?? string.Empty));
    }

    public static async Task<Results<Ok<GoogleLoginResponse>, UnauthorizedHttpResult>> GetCurrentUser(
        UserManager<ApplicationUser> userManager,
        ClaimsPrincipal user)
    {
        if (user?.Identity?.IsAuthenticated != true)
        {
            return TypedResults.Unauthorized();
        }

        var currentUser = await userManager.GetUserAsync(user);
        if (currentUser is null)
        {
            return TypedResults.Unauthorized();
        }

        return TypedResults.Ok(new GoogleLoginResponse(
            currentUser.Id,
            currentUser.Email ?? string.Empty,
            currentUser.UserName ?? string.Empty));
    }
}
