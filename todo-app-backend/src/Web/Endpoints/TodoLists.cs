using todo_app_backend.Application.TodoLists.Commands.CreateTodoList;
using todo_app_backend.Application.TodoLists.Commands.DeleteTodoList;
using todo_app_backend.Application.TodoLists.Commands.UpdateTodoList;
using todo_app_backend.Application.TodoLists.Queries.GetTodos;
using todo_app_backend.Application.TodoLists.Queries.GetTodoListById;
using Microsoft.AspNetCore.Http.HttpResults;

namespace todo_app_backend.Web.Endpoints;

public class TodoLists : IEndpointGroup
{
    public static void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.RequireAuthorization();

        groupBuilder.MapGet(GetTodoLists);
        groupBuilder.MapGet(GetTodoListById, "{id}");
        groupBuilder.MapPost(CreateTodoList);
        groupBuilder.MapPut(UpdateTodoList, "{id}");
        groupBuilder.MapDelete(DeleteTodoList, "{id}");
    }

    [EndpointSummary("Get all Todo Lists")]
    [EndpointDescription("Retrieves all todo lists along with their items.")]
    public static async Task<Ok<TodosVm>> GetTodoLists(ISender sender)
    {
        var vm = await sender.Send(new GetTodosQuery());

        return TypedResults.Ok(vm);
    }

    [EndpointSummary("Get Todo List by ID")]
    [EndpointDescription("Retrieves a specific todo list and its items by ID.")]
    public static async Task<Results<Ok<TodoListDto>, NotFound>> GetTodoListById(ISender sender, int id)
    {
        var todoList = await sender.Send(new GetTodoListByIdQuery(id));

        if (todoList is null)
        {
            return TypedResults.NotFound();
        }

        return TypedResults.Ok(todoList);
    }

    [EndpointSummary("Create a new Todo List")]
    [EndpointDescription("Creates a new todo list using the provided details and returns the ID of the created list.")]
    public static async Task<Created<int>> CreateTodoList(ISender sender, CreateTodoListCommand command)
    {
        var id = await sender.Send(command);

        return TypedResults.Created($"/{nameof(TodoLists)}/{id}", id);
    }

    [EndpointSummary("Update a Todo List")]
    [EndpointDescription("Updates the specified todo list. The ID in the URL must match the ID in the payload.")]
    public static async Task<Results<NoContent, BadRequest>> UpdateTodoList(ISender sender, int id, UpdateTodoListCommand command)
    {
        if (id != command.Id) return TypedResults.BadRequest();

        await sender.Send(command);

        return TypedResults.NoContent();
    }

    [EndpointSummary("Delete a Todo List")]
    [EndpointDescription("Deletes the todo list with the specified ID.")]
    public static async Task<NoContent> DeleteTodoList(ISender sender, int id)
    {
        await sender.Send(new DeleteTodoListCommand(id));

        return TypedResults.NoContent();
    }
}
