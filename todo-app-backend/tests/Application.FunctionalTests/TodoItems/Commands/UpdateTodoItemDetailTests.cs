using todo_app_backend.Application.TodoItems.Commands.CreateTodoItem;
using todo_app_backend.Application.TodoItems.Commands.UpdateTodoItemDetail;
using todo_app_backend.Application.TodoLists.Commands.CreateTodoList;
using todo_app_backend.Domain.Entities;
using todo_app_backend.Domain.Enums;

namespace todo_app_backend.Application.FunctionalTests.TodoItems.Commands;

public class UpdateTodoItemDetailTests : TestBase
{
    [Test]
    public async Task ShouldRequireValidTodoItemId()
    {
        var command = new UpdateTodoItemDetailCommand { Id = 99, ListId = 1, Priority = PriorityLevel.Low };

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

        var command = new UpdateTodoItemDetailCommand
        {
            Id = itemId,
            ListId = listId,
            Note = "This is the note.",
            Priority = PriorityLevel.High
        };

        await TestApp.SendAsync(command);

        item = await TestApp.FindAsync<TodoItem>(itemId);

        item.ShouldNotBeNull();
        item!.ListId.ShouldBe(command.ListId);
        item.Note.ShouldBe(command.Note);
        item.Priority.ShouldBe(command.Priority);
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

        var command = new UpdateTodoItemDetailCommand
        {
            Id = itemId,
            ListId = listId,
            Note = "This is the note.",
            Priority = PriorityLevel.High
        };

        await Should.ThrowAsync<NotFoundException>(() => TestApp.SendAsync(command));
    }

    [Test]
    public async Task ShouldRequireValidDestinationListId()
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

        var command = new UpdateTodoItemDetailCommand
        {
            Id = itemId,
            ListId = 99,
            Note = "This is the note.",
            Priority = PriorityLevel.High
        };

        await Should.ThrowAsync<NotFoundException>(() => TestApp.SendAsync(command));
    }

    [Test]
    public async Task ShouldMoveTodoItemToAnotherList()
    {
        var userId = await TestApp.RunAsDefaultUserAsync();

        var list1 = new TodoList
        {
            Title = "New List 1"
        };
        await TestApp.AddAsync(list1);
        var list1Id = list1.Id;

        var list2 = new TodoList
        {
            Title = "New List 2"
        };
        await TestApp.AddAsync(list2);
        var list2Id = list2.Id;

        var item = new TodoItem
        {
            ListId = list1Id,
            Title = "New Item"
        };
        await TestApp.AddAsync(item);
        var itemId = item.Id;

        var command = new UpdateTodoItemDetailCommand
        {
            Id = itemId,
            ListId = list2Id,
            Note = "This is the note.",
            Priority = PriorityLevel.High
        };

        await TestApp.SendAsync(command);

        item = await TestApp.FindAsync<TodoItem>(itemId);

        item.ShouldNotBeNull();
        item!.ListId.ShouldBe(command.ListId);
    }

    [Test]
    public async Task ShouldNotMoveTodoItemToAnotherUsersList()
    {
        var userId = await TestApp.RunAsDefaultUserAsync();

        var list1 = new TodoList
        {
            Title = "New List 1"
        };
        await TestApp.AddAsync(list1);
        var list1Id = list1.Id;

        var otheruserId = await TestApp.RunAsUserAsync("other@local", "Testing1234!", []);

        var list2 = new TodoList
        {
            Title = "New List 2"
        };
        await TestApp.AddAsync(list2);
        var list2Id = list2.Id;

        var item = new TodoItem
        {
            ListId = list2Id,
            Title = "New Item"
        };
        await TestApp.AddAsync(item);
        var itemId = item.Id;

        var command = new UpdateTodoItemDetailCommand
        {
            Id = itemId,
            ListId = list1Id,
            Note = "This is the note.",
            Priority = PriorityLevel.High
        };

        await Should.ThrowAsync<NotFoundException>(() => TestApp.SendAsync(command));
    }
}
