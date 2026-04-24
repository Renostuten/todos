using todo_app_backend.Application.Common.Interfaces;
using todo_app_backend.Application.Common.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using todo_app_backend.Application.Auth.Common.Models;

namespace todo_app_backend.Infrastructure.Identity;

public class IdentityService : IIdentityService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IUserClaimsPrincipalFactory<ApplicationUser> _userClaimsPrincipalFactory;
    private readonly IAuthorizationService _authorizationService;

    public IdentityService(
        UserManager<ApplicationUser> userManager,
        IUserClaimsPrincipalFactory<ApplicationUser> userClaimsPrincipalFactory,
        IAuthorizationService authorizationService)
    {
        _userManager = userManager;
        _userClaimsPrincipalFactory = userClaimsPrincipalFactory;
        _authorizationService = authorizationService;
    }

    public async Task<string?> GetUserNameAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);

        return user?.UserName;
    }

    public async Task<(Result Result, string UserId)> CreateUserAsync(string userName, string password)
    {
        var user = new ApplicationUser
        {
            UserName = userName,
            Email = userName,
        };

        var result = await _userManager.CreateAsync(user, password);

        return (result.ToApplicationResult(), user.Id);
    }

    public async Task<bool> IsInRoleAsync(string userId, string role)
    {
        var user = await _userManager.FindByIdAsync(userId);

        return user != null && await _userManager.IsInRoleAsync(user, role);
    }

    public async Task<bool> AuthorizeAsync(string userId, string policyName)
    {
        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
        {
            return false;
        }

        var principal = await _userClaimsPrincipalFactory.CreateAsync(user);

        var result = await _authorizationService.AuthorizeAsync(principal, policyName);

        return result.Succeeded;
    }

    public async Task<Result> DeleteUserAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);

        return user != null ? await DeleteUserAsync(user) : Result.Success();
    }

    public async Task<Result> DeleteUserAsync(ApplicationUser user)
    {
        var result = await _userManager.DeleteAsync(user);

        return result.ToApplicationResult();
    }

    public async Task<GoogleLoginResponse> CreateGoogleUserAsync(
        string userName,
        PendingGoogleSignup pendingSignup,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(pendingSignup.Subject) ||
            string.IsNullOrWhiteSpace(pendingSignup.Email))
        {
            throw new InvalidOperationException("Pending signup data is incomplete.");
        }

        if (string.IsNullOrWhiteSpace(userName))
        {
            throw new InvalidOperationException("Username is required.");
        }

        var trimmedUserName = userName.Trim();

        var existingGoogleUser = await _userManager.Users
            .FirstOrDefaultAsync(
                user => user.GoogleSubject == pendingSignup.Subject,
                cancellationToken);

        if (existingGoogleUser is not null)
        {
            throw new InvalidOperationException("This Google account is already linked.");
        }

        var existingUserName = await _userManager.FindByNameAsync(trimmedUserName);

        if (existingUserName is not null)
        {
            throw new InvalidOperationException("Username is already taken.");
        }

        var user = new ApplicationUser
        {
            UserName = trimmedUserName,
            Email = pendingSignup.Email,
            EmailConfirmed = true,
            GoogleSubject = pendingSignup.Subject,
            GoogleEmail = pendingSignup.Email
        };

        var createResult = await _userManager.CreateAsync(user);

        if (!createResult.Succeeded)
        {
            var errors = createResult.Errors.Select(error => error.Description);
            throw new InvalidOperationException(
                $"Failed to create user. {string.Join(", ", errors)}");
        }

        return new GoogleLoginResponse(
            user.Id,
            user.Email ?? string.Empty,
            user.UserName ?? string.Empty);
    }
}
