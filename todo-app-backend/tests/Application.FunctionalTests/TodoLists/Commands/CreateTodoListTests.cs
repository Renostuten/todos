using todo_app_backend.Application.Common.Exceptions;
using todo_app_backend.Application.TodoLists.Commands.CreateTodoList;
using todo_app_backend.Domain.Entities;
using todo_app_backend.Domain.Exceptions;

namespace todo_app_backend.Application.FunctionalTests.TodoLists.Commands;

public class CreateTodoListTests : TestBase
{
    [Test]
    public async Task ShouldRequireMinimumFields()
    {
        var command = new CreateTodoListCommand();
        await Should.ThrowAsync<ValidationException>(() => TestApp.SendAsync(command));
    }

    [Test]
    public async Task ShouldRequireUniqueTitle()
    {
        await TestApp.SendAsync(new CreateTodoListCommand
        {
            Title = "Shopping"
        });

        var command = new CreateTodoListCommand
        {
            Title = "Shopping"
        };

        await Should.ThrowAsync<ValidationException>(() => TestApp.SendAsync(command));
    }

    [Test]
    public async Task ShouldCreateTodoList()
    {
        var userId = await TestApp.RunAsDefaultUserAsync();

        var command = new CreateTodoListCommand
        {
            Title = "Tasks",
            Colour = Domain.ValueObjects.Colour.Red,
            DueDate = DateTime.Today.AddDays(7)
        };

        var id = await TestApp.SendAsync(command);

        var list = await TestApp.FindAsync<TodoList>(id);

        list.ShouldNotBeNull();
        list!.Title.ShouldBe(command.Title);
        list.CreatedBy.ShouldBe(userId);
        list.Colour.ToString().ShouldBe(command.Colour);
        list.DueDate.ShouldBe(command.DueDate);
        list.Created.ShouldBe(DateTime.Now, TimeSpan.FromMilliseconds(10000));
    }

    [Test]
    public async Task ShouldCreateMultipleListsForSameUser()
    {
        var userId = await TestApp.RunAsDefaultUserAsync();

        var command1 = new CreateTodoListCommand
        {
            Title = "Work"
        };

        var command2 = new CreateTodoListCommand
        {
            Title = "Personal"
        };

        var id1 = await TestApp.SendAsync(command1);
        var id2 = await TestApp.SendAsync(command2);

        var list1 = await TestApp.FindAsync<TodoList>(id1);
        var list2 = await TestApp.FindAsync<TodoList>(id2);

        list1.ShouldNotBeNull();
        list1!.Title.ShouldBe(command1.Title);
        list1.CreatedBy.ShouldBe(userId);

        list2.ShouldNotBeNull();
        list2!.Title.ShouldBe(command2.Title);
        list2.CreatedBy.ShouldBe(userId);
    }

    [Test]
    public async Task ShouldAllowSameTitleForDifferentUsers()
    {
        var userId1 = await TestApp.RunAsUserAsync("user1", "Password1!", Array.Empty<string>());
        
        await TestApp.SendAsync(new CreateTodoListCommand
        {
            Title = "Shopping"
        });

        var userId2 = await TestApp.RunAsUserAsync("user2", "Password2!", Array.Empty<string>());

        var command = new CreateTodoListCommand
        {
            Title = "Shopping"
        };

        var id = await TestApp.SendAsync(command);

        var list = await TestApp.FindAsync<TodoList>(id);

        list.ShouldNotBeNull();
        list!.Title.ShouldBe(command.Title);
        list.CreatedBy.ShouldBe(userId2);
    }

    [Test]
    public async Task ShouldNotAllowInvalidColour()
    {
        var userId = await TestApp.RunAsDefaultUserAsync();

        var command = new CreateTodoListCommand
        {
            Title = "Shopping",
            Colour = "InvalidColour"
        };

        await Should.ThrowAsync<UnsupportedColourException>(() => TestApp.SendAsync(command));
    }

    [Test]
    public async Task ShouldNotAllowEmptyTitle()
    {
        var command = new CreateTodoListCommand
        {
            Title = string.Empty
        };

        await Should.ThrowAsync<ValidationException>(() => TestApp.SendAsync(command));
    }
}

