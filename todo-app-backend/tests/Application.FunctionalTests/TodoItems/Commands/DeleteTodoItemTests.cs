using todo_app_backend.Application.TodoItems.Commands.CreateTodoItem;
using todo_app_backend.Application.TodoItems.Commands.DeleteTodoItem;
using todo_app_backend.Application.TodoLists.Commands.CreateTodoList;
using todo_app_backend.Domain.Entities;

namespace todo_app_backend.Application.FunctionalTests.TodoItems.Commands;

public class DeleteTodoItemTests : TestBase
{
    [Test]
    public async Task ShouldRequireValidTodoItemId()
    {
        var command = new DeleteTodoItemCommand(99);

        await Should.ThrowAsync<NotFoundException>(() => TestApp.SendAsync(command));
    }

    [Test]
    public async Task ShouldDeleteTodoItem()
    {
        var userId = await TestApp.RunAsDefaultUserAsync();

        var list = new TodoList
        {
            Title = "New List"
        };
        await TestApp.AddAsync(list);
        var listId = list.Id;

        var item = new TodoItem
        {
            ListId = listId,
            Title = "New Item"
        };
        await TestApp.AddAsync(item);
        var itemId = item.Id;

        await TestApp.SendAsync(new DeleteTodoItemCommand(itemId));

        item = await TestApp.FindAsync<TodoItem>(itemId);

        item.ShouldBeNull();
    }

    [Test]
    public async Task ShouldNotDeleteTodoItemOfAnotherUser()
    {
        var userId = await TestApp.RunAsDefaultUserAsync();

        var list = new TodoList
        {
            Title = "New List"
        };
        await TestApp.AddAsync(list);
        var listId = list.Id;

        var item = new TodoItem
        {
            ListId = listId,
            Title = "New Item"
        };
        await TestApp.AddAsync(item);
        var itemId = item.Id;

        var otheruserId = await TestApp.RunAsUserAsync("other@local", "Testing1234!", []);

        await Should.ThrowAsync<NotFoundException>(() => TestApp.SendAsync(new DeleteTodoItemCommand(itemId)));
    }
}
