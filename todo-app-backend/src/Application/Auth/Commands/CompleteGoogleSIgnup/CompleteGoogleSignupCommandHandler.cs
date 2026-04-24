using MediatR;
using todo_app_backend.Application.Auth.Common.Models;
using todo_app_backend.Application.Common.Interfaces;

namespace todo_app_backend.Application.Auth.Commands.CompleteGoogleSignup;

public sealed class CompleteGoogleSignupCommandHandler
    : IRequestHandler<CompleteGoogleSignupCommand, GoogleLoginResponse>
{
    private readonly IIdentityService _identityService;

    public CompleteGoogleSignupCommandHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task<GoogleLoginResponse> Handle(
        CompleteGoogleSignupCommand request,
        CancellationToken cancellationToken)
    {
        return await _identityService.CreateGoogleUserAsync(
            request.UserName,
            request.PendingSignup,
            cancellationToken);
    }
}