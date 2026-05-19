using todo_app_backend.Application.Common.Interfaces;
using todo_app_backend.Domain.Entities;

namespace todo_app_backend.Application.TodoItems.Commands.ToggleTodoItem;

public record ToggleTodoItemCommand : IRequest
{
    public int Id { get; init; }

    public bool Done { get; init; }
}

public class ToggleTodoItemCommandHandler : IRequestHandler<ToggleTodoItemCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _user;

    public ToggleTodoItemCommandHandler(IApplicationDbContext context, IUser user)
    {
        _context = context;
        _user = user;
    }

    public async Task Handle(ToggleTodoItemCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.TodoItems
            .Include(i => i.List)
            .FirstOrDefaultAsync(
                i => i.Id == request.Id && i.List.CreatedBy == _user.Id,
                cancellationToken);

        if (entity is null)
        {
            throw new NotFoundException(nameof(TodoItem), request.Id.ToString());
        }

        entity.Done = request.Done;

        await _context.SaveChangesAsync(cancellationToken);
    }
}