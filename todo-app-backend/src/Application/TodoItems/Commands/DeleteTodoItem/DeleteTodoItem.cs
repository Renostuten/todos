using todo_app_backend.Application.Common.Interfaces;
using todo_app_backend.Domain.Entities;

namespace todo_app_backend.Application.TodoItems.Commands.DeleteTodoItem;

public record DeleteTodoItemCommand(int Id) : IRequest;

public class DeleteTodoItemCommandHandler : IRequestHandler<DeleteTodoItemCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _user;

    public DeleteTodoItemCommandHandler(IApplicationDbContext context, IUser user)
    {
        _context = context;
        _user = user;
    }

    public async Task Handle(DeleteTodoItemCommand request, CancellationToken cancellationToken)
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

        _context.TodoItems.Remove(entity);

        await _context.SaveChangesAsync(cancellationToken);
    }

}
