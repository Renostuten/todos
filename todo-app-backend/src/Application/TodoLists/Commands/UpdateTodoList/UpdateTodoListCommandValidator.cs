using todo_app_backend.Application.Common.Interfaces;

namespace todo_app_backend.Application.TodoLists.Commands.UpdateTodoList;

public class UpdateTodoListCommandValidator : AbstractValidator<UpdateTodoListCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _user;

    public UpdateTodoListCommandValidator(IApplicationDbContext context, IUser user)
    {
        _context = context;
        _user = user;

        RuleFor(v => v.Title)
            .NotEmpty()
            .MaximumLength(200)
            .MustAsync(BeUniqueTitle)
                .WithMessage("'{PropertyName}' must be unique.")
                .WithErrorCode("Unique");
    }

    public async Task<bool> BeUniqueTitle(UpdateTodoListCommand model, string title, CancellationToken cancellationToken)
    {
        return !await _context.TodoLists
            .Where(l => l.Id != model.Id)
            .AnyAsync(l => l.Title == title && l.CreatedBy == _user.Id, cancellationToken);
    }
}
