using todo_app_backend.Application.Common.Interfaces;
using todo_app_backend.Domain.Entities;
using todo_app_backend.Domain.Enums;

namespace todo_app_backend.Application.TodoItems.Commands.UpdateTodoItemDetail;

public record UpdateTodoItemDetailCommand : IRequest
{
    public int Id { get; init; }

    public int ListId { get; init; }

    public PriorityLevel Priority { get; init; }

    public string? Note { get; init; }
}

public class UpdateTodoItemDetailCommandHandler : IRequestHandler<UpdateTodoItemDetailCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _user;

    public UpdateTodoItemDetailCommandHandler(IApplicationDbContext context, IUser user)
    {
        _context = context;
        _user = user;
    }

    public async Task Handle(UpdateTodoItemDetailCommand request, CancellationToken cancellationToken)
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

        var destinationListExists = await _context.TodoLists
            .AnyAsync(
                l => l.Id == request.ListId && l.CreatedBy == _user.Id,
                cancellationToken);

        if (!destinationListExists)
        {
            throw new NotFoundException(nameof(TodoList), request.ListId.ToString());
        }

        entity.ListId = request.ListId;
        entity.Priority = request.Priority;
        entity.Note = request.Note;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
