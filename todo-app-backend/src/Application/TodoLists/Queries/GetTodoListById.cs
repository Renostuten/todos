using todo_app_backend.Application.Common.Interfaces;
using todo_app_backend.Application.Common.Models;
using todo_app_backend.Application.Common.Security;
using todo_app_backend.Application.TodoLists.Queries.GetTodos;
using todo_app_backend.Domain.Enums;
using todo_app_backend.Domain.ValueObjects;

namespace todo_app_backend.Application.TodoLists.Queries.GetTodoListById;

public record GetTodoListByIdQuery(int Id) : IRequest<TodoListDto?>;

public class GetTodoListByIdQueryHandler : IRequestHandler<GetTodoListByIdQuery, TodoListDto?>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;

    public GetTodoListByIdQueryHandler(IApplicationDbContext context, IMapper mapper, IUser user)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
    }

    public async Task<TodoListDto?> Handle(GetTodoListByIdQuery request, CancellationToken cancellationToken)
    {
        return await _context.TodoLists
            .AsNoTracking()
            .Where(t => t.Id == request.Id && t.CreatedBy == _user.Id)
            .ProjectTo<TodoListDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);
    }
}