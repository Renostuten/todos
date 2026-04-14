using FluentValidation;
using MediatR;
using NUnit.Framework;
using Shouldly;
using todo_app_backend.Application.Common.Behaviours;
using ApplicationValidationException = todo_app_backend.Application.Common.Exceptions.ValidationException;

namespace todo_app_backend.Application.UnitTests.Common.Behaviours;

public class ValidationBehaviourTests
{
    [Test]
    public async Task ShouldInvokeNextWhenNoValidatorsAreRegistered()
    {
        var behaviour = new ValidationBehaviour<SampleRequest, Unit>(Array.Empty<IValidator<SampleRequest>>());
        var nextWasCalled = false;

        var response = await behaviour.Handle(
            new SampleRequest { Name = string.Empty },
            _ =>
            {
                nextWasCalled = true;
                return Task.FromResult(Unit.Value);
            },
            CancellationToken.None);

        nextWasCalled.ShouldBeTrue();
        response.ShouldBe(Unit.Value);
    }

    [Test]
    public async Task ShouldInvokeNextWhenValidationPasses()
    {
        var validators = new[] { new SampleRequestValidator() };
        var behaviour = new ValidationBehaviour<SampleRequest, Unit>(validators);
        var nextWasCalled = false;

        await behaviour.Handle(
            new SampleRequest { Name = "valid" },
            _ =>
            {
                nextWasCalled = true;
                return Task.FromResult(Unit.Value);
            },
            CancellationToken.None);

        nextWasCalled.ShouldBeTrue();
    }

    [Test]
    public async Task ShouldThrowValidationExceptionWhenValidationFails()
    {
        var validators = new[] { new SampleRequestValidator() };
        var behaviour = new ValidationBehaviour<SampleRequest, Unit>(validators);

        await Should.ThrowAsync<ApplicationValidationException>(() =>
            behaviour.Handle(
                new SampleRequest { Name = string.Empty },
                _ => Task.FromResult(Unit.Value),
                CancellationToken.None));
    }

    private sealed class SampleRequest : IRequest<Unit>
    {
        public string Name { get; init; } = string.Empty;
    }

    private sealed class SampleRequestValidator : AbstractValidator<SampleRequest>
    {
        public SampleRequestValidator()
        {
            RuleFor(x => x.Name).NotEmpty();
        }
    }
}