using todo_app_backend.Application.Common.Interfaces;

namespace todo_app_backend.Application.TodoItems.Commands.ToggleTodoItem;

public record ToggleTodoItemCommand : IRequest
{
    public int Id { get; init; }

    public bool Done { get; init; }
}

public class ToggleTodoItemCommandHandler : IRequestHandler<ToggleTodoItemCommand>
{
    private readonly IApplicationDbContext _context;

    public ToggleTodoItemCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(ToggleTodoItemCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.TodoItems
            .FindAsync([request.Id], cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        entity.Done = request.Done;

        await _context.SaveChangesAsync(cancellationToken);
    }
}