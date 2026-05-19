using todo_app_backend.Application.Common.Exceptions;
using todo_app_backend.Application.TodoLists.Commands.CreateTodoList;
using todo_app_backend.Application.TodoLists.Commands.UpdateTodoList;
using todo_app_backend.Domain.Entities;

namespace todo_app_backend.Application.FunctionalTests.TodoLists.Commands;

public class UpdateTodoListTests : TestBase
{
    [Test]
    public async Task ShouldRequireValidTodoListId()
    {
        var command = new UpdateTodoListCommand { Id = 99, Title = "New Title" };
        await Should.ThrowAsync<NotFoundException>(() => TestApp.SendAsync(command));
    }

    [Test]
    public async Task ShouldRequireUniqueTitle()
    {
        await TestApp.RunAsDefaultUserAsync();

        var list = new TodoList
        {
            Title = "New List"
        };
        await TestApp.AddAsync(list);
        var listId = list.Id;

        var list2 = new TodoList
        {
            Title = "Other List"
        };
        await TestApp.AddAsync(list2);

        var command = new UpdateTodoListCommand
        {
            Id = listId,
            Title = "Other List"
        };

        var ex = await Should.ThrowAsync<ValidationException>(() => TestApp.SendAsync(command));

        ex.Errors.ShouldContainKey("Title");
        ex.Errors["Title"].ShouldContain("'Title' must be unique.");
    }

    [Test]
    public async Task ShouldUpdateTodoListMandatoryFields()
    {
        var userId = await TestApp.RunAsDefaultUserAsync();

        var list = new TodoList
        {
            Title = "New List"
        };
        await TestApp.AddAsync(list);
        var listId = list.Id;

        var command = new UpdateTodoListCommand
        {
            Id = listId,
            Title = "Updated List Title"
        };

        await TestApp.SendAsync(command);

        list = await TestApp.FindAsync<TodoList>(listId);

        list.ShouldNotBeNull();
        list!.Title.ShouldBe(command.Title);
        list.LastModifiedBy.ShouldNotBeNull();
        list.LastModifiedBy.ShouldBe(userId);
        list.LastModified.ShouldBe(DateTime.Now, TimeSpan.FromMilliseconds(10000));
    }

    [Test]
    public async Task ShouldUpdateTodoListOptionalFields()
    {
        var userId = await TestApp.RunAsDefaultUserAsync();

        var list = new TodoList
        {
            Title = "New List"
        };
        await TestApp.AddAsync(list);
        var listId = list.Id;

        var command = new UpdateTodoListCommand
        {
            Id = listId,
            Title = "Updated List Title",
            Colour = Domain.ValueObjects.Colour.Red,
            DueDate = DateTime.Today.AddDays(7)
        };

        await TestApp.SendAsync(command);

        list = await TestApp.FindAsync<TodoList>(listId);

        list.ShouldNotBeNull();
        list!.Colour.ToString().ShouldBe(command.Colour);
        list.DueDate.ShouldBe(command.DueDate);
    }

    [Test]
    public async Task ShouldNotUpdateTodoListOfAnotherUser()
    {
        await TestApp.RunAsDefaultUserAsync();

        var list = new TodoList
        {
            Title = "New List"
        };
        await TestApp.AddAsync(list);
        var listId = list.Id;

        await TestApp.RunAsUserAsync("other@local", "Testing1234!", []);

        var command = new UpdateTodoListCommand
        {
            Id = listId,
            Title = "Updated List Title"
        };

        await Should.ThrowAsync<NotFoundException>(() => TestApp.SendAsync(command));
    }
}
