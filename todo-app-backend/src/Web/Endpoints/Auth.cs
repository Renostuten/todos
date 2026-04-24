using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using todo_app_backend.Infrastructure.Identity;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using todo_app_backend.Application.Auth.Common.Models;
using todo_app_backend.Application.Common.Interfaces;
using todo_app_backend.Web.Infrastructure.Authentication;

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
        IGoogleAuthService googleAuthService,
        IOAuthStateService oAuthStateService)
    {
        var state = oAuthStateService.CreateState(httpContext);

        var authorizationUrl = googleAuthService.BuildAuthorizationUrl(state);

        return TypedResults.Redirect(authorizationUrl);
    }

    public static async Task<IResult> GoogleCallback(
        HttpContext httpContext,
        IGoogleAuthService googleAuthService,
        IOAuthStateService oAuthStateService,
        IPendingGoogleSignupService pendingGoogleSignupService,
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

        if (!oAuthStateService.IsValidState(httpContext, state))
        {
            return TypedResults.Unauthorized();
        }

        oAuthStateService.ClearState(httpContext);

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

        pendingGoogleSignupService.Store(httpContext, pendingSignup);

        return TypedResults.Redirect(frontendSignupUrl);
    }

    public static async Task<IResult> CompleteSignup(
        HttpContext httpContext,
        [FromBody] CompleteGoogleSignupRequest request,
        IPendingGoogleSignupService pendingGoogleSignupService,
        IIdentityService identityService,
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        CancellationToken cancellationToken)
    {
        var pendingSignup = pendingGoogleSignupService.Get(httpContext);

        if (pendingSignup is null)
        {
            return TypedResults.BadRequest(new { error = "No pending Google signup found." });
        }

        if (request is null || string.IsNullOrWhiteSpace(request.UserName))
        {
            return TypedResults.BadRequest(new { error = "Username is required." });
        }

        try
        {
            var response = await identityService.CreateGoogleUserAsync(
                request.UserName,
                pendingSignup,
                cancellationToken);

            var user = await userManager.FindByIdAsync(response.UserId);

            if (user is null)
            {
                return TypedResults.BadRequest(new { error = "Created user could not be found." });
            }

            pendingGoogleSignupService.Clear(httpContext);

            await signInManager.SignInAsync(user, isPersistent: false);

            return TypedResults.Ok(response);
        }
        catch (InvalidOperationException exception)
        {
            return TypedResults.BadRequest(new { error = exception.Message });
        }
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
