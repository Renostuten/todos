using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using todo_app_backend.Infrastructure.Identity;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;
using System.Text.Json;
using todo_app_backend.Application.Auth.Common.Models;
using todo_app_backend.Application.Common.Interfaces;

namespace todo_app_backend.Web.Endpoints;

public class Auth : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet(StartGoogleLogin, "google/start");
        groupBuilder.MapGet(GoogleCallback, "google/callback");
        groupBuilder.MapPost(CompleteSignup, "signup");
        groupBuilder.MapGet(GetCurrentUser, "me").RequireAuthorization();
    }

    public static RedirectHttpResult StartGoogleLogin(
        HttpContext httpContext,
        IGoogleAuthService googleAuthService)
    {
        var state = GenerateState();

        httpContext.Response.Cookies.Append(
            "google_oauth_state",
            state,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Lax,
                Expires = DateTimeOffset.UtcNow.AddMinutes(10)
            }
        );

        var authorizationUrl = googleAuthService.BuildAuthorizationUrl(state);

        return TypedResults.Redirect(authorizationUrl);
    }

    public static async Task<IResult> GoogleCallback(
        HttpContext httpContext,
        IGoogleAuthService googleAuthService,
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IConfiguration configuration,
        CancellationToken cancellationToken)
    {
        var code = httpContext.Request.Query["code"].ToString();
        var state = httpContext.Request.Query["state"].ToString();
        var error = httpContext.Request.Query["error"].ToString();

        if (!string.IsNullOrWhiteSpace(error))
        {
            return TypedResults.BadRequest(new { error });
        }

        var storedState = httpContext.Request.Cookies["google_oauth_state"];

        if (string.IsNullOrWhiteSpace(storedState) || string.IsNullOrWhiteSpace(state) || state != storedState)
        {
            return TypedResults.Unauthorized();
        }

        httpContext.Response.Cookies.Delete("google_oauth_state");

        if (string.IsNullOrWhiteSpace(code))
        {
            return TypedResults.BadRequest("Authorization code is missing.");
        }

        var responseContent = await googleAuthService.ExchangeCodeForTokenAsync(code, cancellationToken);

        if (responseContent is null || string.IsNullOrWhiteSpace(responseContent.AccessToken))
        {
            return TypedResults.BadRequest("Google token response was invalid.");
        }

        var userInfo = await googleAuthService.GetUserInfoAsync(responseContent.AccessToken, cancellationToken);

        if (userInfo is null || string.IsNullOrWhiteSpace(userInfo.Email) || string.IsNullOrWhiteSpace(userInfo.Subject))
        {
            return TypedResults.BadRequest("Failed to parse user information.");
        }

        var frontendOrigin = configuration["FrontendOrigin"] ?? "http://localhost:5173";
        var frontendSignupUrl = configuration["FrontendSignupUrl"] ?? "http://localhost:5173/signup";

        var user = await userManager.Users.FirstOrDefaultAsync(u => u.GoogleSubject == userInfo.Subject);
        if (user is not null)
        {            
            await signInManager.SignInAsync(user, isPersistent: false);
            return TypedResults.Redirect(frontendOrigin);
        }

        var pendingSignup = new PendingGoogleSignup
        {
            Subject = userInfo.Subject,
            Email = userInfo.Email,
            Name = userInfo.Name
        };

        var pendingSignupJson = JsonSerializer.Serialize(pendingSignup);

        httpContext.Response.Cookies.Append(
            "pending_google_signup",
            pendingSignupJson,
            new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Lax,
                Expires = DateTimeOffset.UtcNow.AddMinutes(10)
            });

        return TypedResults.Redirect(frontendSignupUrl);
    }

    public static async Task<IResult> CompleteSignup(
        HttpContext httpContext,
        [FromBody] CompleteGoogleSignupRequest request,
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager)
    {
        var pendingSignupCookie = httpContext.Request.Cookies["pending_google_signup"];

        if (string.IsNullOrWhiteSpace(pendingSignupCookie))
        {
            return TypedResults.BadRequest(new { error = "No pending Google signup found." });
        }

        PendingGoogleSignup? pendingSignup;
        try
        {
            pendingSignup = JsonSerializer.Deserialize<PendingGoogleSignup>(pendingSignupCookie);
        }
        catch (JsonException)
        {
            return TypedResults.BadRequest(new { error = "Pending signup data is invalid." });
        }

        if (pendingSignup is null ||
            string.IsNullOrWhiteSpace(pendingSignup.Subject) ||
            string.IsNullOrWhiteSpace(pendingSignup.Email))
        {
            return TypedResults.BadRequest(new { error = "Pending signup data is incomplete." });
        }

        if (request is null || string.IsNullOrWhiteSpace(request.UserName))
        {
            return TypedResults.BadRequest(new { error = "Username is required." });
        }

        var trimmedUserName = request.UserName.Trim();

        var existingGoogleUser = await userManager.Users
            .FirstOrDefaultAsync(u => u.GoogleSubject == pendingSignup.Subject);

        if (existingGoogleUser is not null)
        {
            return TypedResults.BadRequest(new { error = "This Google account is already linked." });
        }

        var existingUserName = await userManager.FindByNameAsync(trimmedUserName);
        if (existingUserName is not null)
        {
            return TypedResults.BadRequest(new { error = "Username is already taken." });
        }

        var user = new ApplicationUser
        {
            UserName = trimmedUserName,
            Email = pendingSignup.Email,
            EmailConfirmed = true,
            GoogleSubject = pendingSignup.Subject,
            GoogleEmail = pendingSignup.Email
        };

        var createResult = await userManager.CreateAsync(user);

        if (!createResult.Succeeded)
        {
            return TypedResults.BadRequest(new
            {
                error = "Failed to create user.",
                details = createResult.Errors.Select(e => e.Description)
            });
        }

        httpContext.Response.Cookies.Delete("pending_google_signup");

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

    private static string GenerateState()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToBase64String(bytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");
    }
}
