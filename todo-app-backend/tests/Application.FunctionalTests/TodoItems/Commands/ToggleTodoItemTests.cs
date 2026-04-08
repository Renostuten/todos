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

        var listId = await TestApp.SendAsync(new CreateTodoListCommand
        {
            Title = "New List"
        });

        var createCommand = new CreateTodoItemCommand
        {
            ListId = listId,
            Title = "Tasks"
        };

        var itemId = await TestApp.SendAsync(createCommand);

        var toggleCommand = new ToggleTodoItemCommand
        {
            Id = itemId,
            Done = true
        };

        await TestApp.SendAsync(toggleCommand);
        var item = await TestApp.FindAsync<TodoItem>(itemId);

        item.ShouldNotBeNull();
        item.Done.ShouldBe(true);
        item.LastModifiedBy.ShouldBe(userId);
        item.LastModified.ShouldBe(DateTime.Now, TimeSpan.FromMilliseconds(10000));
    }
}