using FluentValidation;

namespace todo_app_backend.Application.TodoItems.Commands.ToggleTodoItem;

public class ToggleTodoItemCommandValidator : AbstractValidator<ToggleTodoItemCommand>
{
    public ToggleTodoItemCommandValidator()
    {
        RuleFor(v => v.Id)
            .GreaterThan(0);
    }
}
