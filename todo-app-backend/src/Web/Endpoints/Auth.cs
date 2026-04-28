using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
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
        groupBuilder.MapGet(GoogleCallback, "google/finalcallback");
        groupBuilder.MapPost(CompleteSignup, "signup");
        groupBuilder.MapGet(GetCurrentUser, "me");
    }

    public static IResult StartGoogleLogin(
        SignInManager<ApplicationUser> signInManager)
    {
        var properties = signInManager.ConfigureExternalAuthenticationProperties(
            OpenIdConnectDefaults.AuthenticationScheme,
            "/api/auth/google/finalcallback");

        return TypedResults.Challenge(
            properties,
            [OpenIdConnectDefaults.AuthenticationScheme]);
    }   

    public static async Task<IResult> GoogleCallback(
        HttpContext httpContext,
        IPendingGoogleSignupService pendingGoogleSignupService,
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IConfiguration configuration)
    { 
        Console.WriteLine("Google callback invoked.");
        var frontendOrigin = configuration["FrontendOrigin"] ?? "http://localhost:5173";
        var frontendSignupUrl = configuration["FrontendSignupUrl"] ?? "http://localhost:5173/signup";

        var info = await signInManager.GetExternalLoginInfoAsync();
        if (info is null)
        {
            Console.WriteLine("No external login info.");
            return TypedResults.Redirect(frontendOrigin);
        }

        var subject = info.Principal.FindFirstValue(ClaimTypes.NameIdentifier);
        var email = info.Principal.FindFirstValue(ClaimTypes.Email);
        var name = info.Principal.FindFirstValue(ClaimTypes.Name);

        if (string.IsNullOrWhiteSpace(subject) || string.IsNullOrWhiteSpace(email))
        {
            Console.WriteLine("Subject or email is missing.");
            return TypedResults.Redirect(frontendOrigin);
        }

        var user = await userManager.Users.FirstOrDefaultAsync(u => u.GoogleSubject == subject);
        if (user is not null)
        {            
            await signInManager.SignInAsync(user, isPersistent: false);
            return TypedResults.Redirect(frontendOrigin);
        }

        var pendingSignup = new PendingGoogleSignup
        {
            Subject = subject,
            Email = email,
            Name = name ?? email
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
            Console.WriteLine("No pending Google signup found.");
            return TypedResults.BadRequest(new { error = "No pending Google signup found." });
        }

        if (request is null || string.IsNullOrWhiteSpace(request.UserName))
        {
            Console.WriteLine("Username is required.");
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
                Console.WriteLine("Created user could not be found.");
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
            Console.WriteLine("No authenticated user.");
            return TypedResults.Unauthorized();
        }

        var currentUser = await userManager.GetUserAsync(user);
        if (currentUser is null)
        {
            Console.WriteLine("Authenticated user not found in database.");
            return TypedResults.Unauthorized();
        }

        return TypedResults.Ok(new GoogleLoginResponse(
            currentUser.Id,
            currentUser.Email ?? string.Empty,
            currentUser.UserName ?? string.Empty));
    }
}
