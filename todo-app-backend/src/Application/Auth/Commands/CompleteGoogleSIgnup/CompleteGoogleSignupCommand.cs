using MediatR;
using todo_app_backend.Application.Auth.Common.Models;

namespace todo_app_backend.Application.Auth.Commands.CompleteGoogleSignup;

public sealed record CompleteGoogleSignupCommand(
    string UserName,
    PendingGoogleSignup PendingSignup) : IRequest<GoogleLoginResponse>;