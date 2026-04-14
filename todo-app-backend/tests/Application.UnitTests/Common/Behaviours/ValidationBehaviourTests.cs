using FluentValidation;
using MediatR;
using NUnit.Framework;
using Shouldly;
using todo_app_backend.Application.Common.Behaviours;
using todo_app_backend.Application.Common.Exceptions;

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
            () =>
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
            () =>
            {
                nextWasCalled = true;
                return Task.FromResult(Unit.Value);
            },
            CancellationToken.None);

        nextWasCalled.ShouldBeTrue();
    }

    [Test]
    public void ShouldThrowValidationExceptionWhenValidationFails()
    {
        var validators = new[] { new SampleRequestValidator() };
        var behaviour = new ValidationBehaviour<SampleRequest, Unit>(validators);

        Should.ThrowAsync<ValidationException>(() => behaviour.Handle(
            new SampleRequest { Name = string.Empty },
            () => Task.FromResult(Unit.Value),
            CancellationToken.None));
    }

    private sealed class SampleRequest
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
