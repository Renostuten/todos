using Microsoft.EntityFrameworkCore;
using todo_app_backend.Application.Common.Interfaces;
using todo_app_backend.Domain.ValueObjects;

namespace todo_app_backend.Application.TodoLists.Commands.UpdateTodoList;

public record UpdateTodoListCommand : IRequest
{
    public int Id { get; init; }

    public string? Title { get; init; }

    public string? Colour { get; init; }

    public DateTime? DueDate { get; init; }
}

public class UpdateTodoListCommandHandler : IRequestHandler<UpdateTodoListCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IUser _user;

    public UpdateTodoListCommandHandler(IApplicationDbContext context, IUser user)
    {
        _context = context;
        _user = user;
    }

    public async Task Handle(UpdateTodoListCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.TodoLists
            .Where(l => l.Id == request.Id && l.CreatedBy == _user.Id)
            .SingleOrDefaultAsync(cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        entity.Title = request.Title;

        if (request.Colour is not null)
        {
            entity.Colour = Colour.From(request.Colour);
        }

        if (request.DueDate.HasValue)
        {
            entity.DueDate = request.DueDate.Value;
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}
