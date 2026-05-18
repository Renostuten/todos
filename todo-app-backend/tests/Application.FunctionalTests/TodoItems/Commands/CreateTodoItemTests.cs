using Humanizer;
using todo_app_backend.Application.Common.Exceptions;
using todo_app_backend.Application.TodoItems.Commands.CreateTodoItem;
using todo_app_backend.Application.TodoLists.Commands.CreateTodoList;
using todo_app_backend.Domain.Entities;

namespace todo_app_backend.Application.FunctionalTests.TodoItems.Commands;

public class CreateTodoItemTests : TestBase
{
    [Test]
    public async Task ShouldRequireMinimumFields()
    {
        var command = new CreateTodoItemCommand();

        await Should.ThrowAsync<ValidationException>(() => TestApp.SendAsync(command));
    }

    [Test]
    public async Task ShouldCreateTodoItem()
    {
        var userId = await TestApp.RunAsDefaultUserAsync();

        var list = new TodoList
        {
            Title = "New List"
        };
        await TestApp.AddAsync(list);
        var listId = list.Id;

        var command = new CreateTodoItemCommand
        {
            ListId = listId,
            Title = "Tasks"
        };

        var itemId = await TestApp.SendAsync(command);

        var item = await TestApp.FindAsync<TodoItem>(itemId);

        item.ShouldNotBeNull();
        item!.ListId.ShouldBe(command.ListId);
        item.Title.ShouldBe(command.Title);
        item.CreatedBy.ShouldBe(userId);
        item.Created.ShouldBe(DateTime.Now, TimeSpan.FromMilliseconds(10000));
        item.LastModifiedBy.ShouldBe(userId);
        item.LastModified.ShouldBe(DateTime.Now, TimeSpan.FromMilliseconds(10000));
    }

    [Test]
    public async Task ShouldRequireExistingList()
    {
        var userId = await TestApp.RunAsDefaultUserAsync();

        var command = new CreateTodoItemCommand
        {
            ListId = 999,
            Title = "Tasks"
        };

        await Should.ThrowAsync<NotFoundException>(() => TestApp.SendAsync(command));
    }

    [Test]
    public async Task ShouldRequireListOwnedByUser()
    {
        var userId = await TestApp.RunAsDefaultUserAsync();

        var list1 = new TodoList
        {
            Title = "New List1"
        };
        await TestApp.AddAsync(list1);
        var list1Id = list1.Id;

        var otherUserId = await TestApp.RunAsUserAsync("other@local", "Testing1234!", []);
        
        var list2 = new TodoList
        {
            Title = "New List2"
        };
        await TestApp.AddAsync(list2);
        var list2Id = list2.Id;

        var command = new CreateTodoItemCommand
        {
            ListId = list1Id,
            Title = "Tasks"
        };

        await Should.ThrowAsync<NotFoundException>(() => TestApp.SendAsync(command));
    }

    [Test]
    public async Task ShouldRequireTitle()
    {
        var userId = await TestApp.RunAsDefaultUserAsync();

        var list = new TodoList
        {
            Title = "New List"
        };
        await TestApp.AddAsync(list);
        var listId = list.Id;

        var command = new CreateTodoItemCommand
        {
            ListId = listId,
            Title = null
        };

        await Should.ThrowAsync<ValidationException>(() => TestApp.SendAsync(command));
    }
}
