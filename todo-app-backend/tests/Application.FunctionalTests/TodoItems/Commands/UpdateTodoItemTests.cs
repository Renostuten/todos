using todo_app_backend.Application.TodoItems.Commands.CreateTodoItem;
using todo_app_backend.Application.TodoItems.Commands.UpdateTodoItem;
using todo_app_backend.Application.TodoLists.Commands.CreateTodoList;
using todo_app_backend.Domain.Entities;

namespace todo_app_backend.Application.FunctionalTests.TodoItems.Commands;

public class UpdateTodoItemTests : TestBase
{
    [Test]
    public async Task ShouldRequireValidTodoItemId()
    {
        var command = new UpdateTodoItemCommand { Id = 99, Title = "New Title" };
        await Should.ThrowAsync<NotFoundException>(() => TestApp.SendAsync(command));
    }

    [Test]
    public async Task ShouldUpdateTodoItem()
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

        var command = new UpdateTodoItemCommand
        {
            Id = itemId,
            Title = "Updated Item Title",
            Done = true
        };

        await TestApp.SendAsync(command);

        item = await TestApp.FindAsync<TodoItem>(itemId);

        item.ShouldNotBeNull();
        item!.Title.ShouldBe(command.Title);
        item.Done.ShouldBe(command.Done);
        item.LastModifiedBy.ShouldNotBeNull();
        item.LastModifiedBy.ShouldBe(userId);
        item.LastModified.ShouldBe(DateTime.Now, TimeSpan.FromMilliseconds(10000));
    }

    [Test]
    public async Task ShouldNotUpdateTodoItemOfAnotherUser()
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

        var command = new UpdateTodoItemCommand
        {
            Id = itemId,
            Title = "Updated Item Title",
            Done = true
        };

        await Should.ThrowAsync<NotFoundException>(() => TestApp.SendAsync(command));
    }
}
