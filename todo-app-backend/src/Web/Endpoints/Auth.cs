using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using todo_app_backend.Infrastructure.Identity;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.WebUtilities;
using System.Security.Cryptography;
using System.Text.Json;

namespace todo_app_backend.Web.Endpoints;

public class Auth : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapPost(SignIn, "google/implicit-login");
        groupBuilder.MapPost(CompleteSignup, "signup");
        groupBuilder.MapGet(GetCurrentUser, "me").RequireAuthorization();
    }

    public sealed record GoogleUserInfoResponse
    {
        [JsonPropertyName("sub")]
        public string Subject { get; init; } = string.Empty;

        [JsonPropertyName("email")]
        public string Email { get; init; } = string.Empty;

        [JsonPropertyName("email_verified")]
        public bool EmailVerified { get; init; }

        [JsonPropertyName("name")]
        public string Name { get; init; } = string.Empty;

        [JsonPropertyName("picture")]
        public string Picture { get; init; } = string.Empty;
    }

    public sealed record PendingGoogleSignup
    {
        public string Subject { get; init; } = string.Empty;
        public string Email { get; init; } = string.Empty;
        public string Name { get; init; } = string.Empty;
    }

    public sealed record CompleteGoogleSignupRequest
    {
        public string UserName { get; init; } = string.Empty;
    }

    public sealed record GoogleLoginRequest
    {
        public string AccessToken { get; init; } = string.Empty;
    }
    public sealed record GoogleLoginResponse(string UserId, string Email, string UserName);

    public static async Task<IResult> SignIn(
        HttpContext httpContext,
        IConfiguration configuration,
        HttpClient httpClient,
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        [FromBody] GoogleLoginRequest request
    )
    {
        var userInfoRequest = new HttpRequestMessage(
            HttpMethod.Get,
            "https://openidconnect.googleapis.com/v1/userinfo"
        );
        userInfoRequest.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", request.AccessToken);

        var userInfoResponse = await httpClient.SendAsync(userInfoRequest);
        if (!userInfoResponse.IsSuccessStatusCode)
        {
            var errorContent = await userInfoResponse.Content.ReadAsStringAsync();
            return TypedResults.BadRequest(new { error = "Failed to fetch user information.", details = errorContent });
        }

        var userInfo = await userInfoResponse.Content.ReadFromJsonAsync<GoogleUserInfoResponse>();
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
}
