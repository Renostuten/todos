using todo_app_backend.Application.Common.Interfaces;
using todo_app_backend.Domain.Entities;

namespace todo_app_backend.Application.TodoItems.Commands.CreateTodoItem;

public record CreateTodoItemCommand : IRequest<int>
{
    public int ListId { get; init; }

    public string? Title { get; init; }
}

public class CreateTodoItemCommandHandler : IRequestHandler<CreateTodoItemCommand, int>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _user;

    public CreateTodoItemCommandHandler(IApplicationDbContext context, IUser user)
    {
        _context = context;
        _user = user;
    }

    public async Task<int> Handle(CreateTodoItemCommand request, CancellationToken cancellationToken)
    {
        var list = await _context.TodoLists
            .FirstOrDefaultAsync(
                l => l.Id == request.ListId && l.CreatedBy == _user.Id,
                cancellationToken);

        if (list is null)
        {
            throw new NotFoundException(nameof(TodoList), request.ListId.ToString());
        }
        
        var entity = new TodoItem
        {
            ListId = request.ListId,
            Title = request.Title,
            Done = false
        };

        _context.TodoItems.Add(entity);

        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
