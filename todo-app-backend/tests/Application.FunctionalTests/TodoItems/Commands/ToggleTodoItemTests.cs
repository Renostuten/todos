using todo_app_backend.Application.Common.Exceptions;
using todo_app_backend.Application.TodoItems.Commands.ToggleTodoItem;
using todo_app_backend.Application.TodoLists.Commands.CreateTodoList;
using todo_app_backend.Application.TodoItems.Commands.CreateTodoItem;
using todo_app_backend.Domain.Entities;

namespace todo_app_backend.Application.FunctionalTests.TodoItems.Commands;

public class ToggleTodoItemTests : TestBase
{
    [Test]
    public async Task ShouldRequireMinimumFields()
    {
        var command = new ToggleTodoItemCommand();

        await Should.ThrowAsync<ValidationException>(() => TestApp.SendAsync(command));
    }

    [Test]
    public async Task ShouldToggleTodoItem()
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

        var toggleCommand = new ToggleTodoItemCommand
        {
            Id = itemId,
            Done = true
        };

        await TestApp.SendAsync(toggleCommand);
        item = await TestApp.FindAsync<TodoItem>(itemId);

        item.ShouldNotBeNull();
        item.Done.ShouldBe(true);
        item.LastModifiedBy.ShouldBe(userId);
        item.LastModified.ShouldBe(DateTime.Now, TimeSpan.FromMilliseconds(10000));
    }

    [Test]
    public async Task ShouldNotToggleTodoItemOfAnotherUser()
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

        var toggleCommand = new ToggleTodoItemCommand
        {
            Id = itemId,
            Done = true
        };

        await Should.ThrowAsync<NotFoundException>(() => TestApp.SendAsync(toggleCommand));
    }

    [Test]
    public async Task ShouldRequireValidItemId()
    {
        var toggleCommand = new ToggleTodoItemCommand
        {
            Id = 999,
            Done = true
        };

        await Should.ThrowAsync<NotFoundException>(() => TestApp.SendAsync(toggleCommand));
    }

    [Test]
    public async Task ShouldToggleTwice()
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

        var toggleCommand1 = new ToggleTodoItemCommand
        {
            Id = itemId,
            Done = true
        };

        await TestApp.SendAsync(toggleCommand1);
        item = await TestApp.FindAsync<TodoItem>(itemId);
        item.ShouldNotBeNull();
        item.Done.ShouldBe(true);

        var toggleCommand2 = new ToggleTodoItemCommand
        {
            Id = itemId,
            Done = false
        };

        await TestApp.SendAsync(toggleCommand2);
        item = await TestApp.FindAsync<TodoItem>(itemId);
        item.ShouldNotBeNull();
        item.Done.ShouldBe(false);
    }
}