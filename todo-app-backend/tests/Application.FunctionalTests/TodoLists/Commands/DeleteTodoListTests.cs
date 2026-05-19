using todo_app_backend.Application.TodoLists.Commands.CreateTodoList;
using todo_app_backend.Application.TodoLists.Commands.DeleteTodoList;
using todo_app_backend.Domain.Entities;

namespace todo_app_backend.Application.FunctionalTests.TodoLists.Commands;

public class DeleteTodoListTests : TestBase
{
    [Test]
    public async Task ShouldRequireValidTodoListId()
    {
        var command = new DeleteTodoListCommand(99);
        await Should.ThrowAsync<NotFoundException>(() => TestApp.SendAsync(command));
    }

    [Test]
    public async Task ShouldDeleteTodoList()
    {
        var userId = await TestApp.RunAsDefaultUserAsync();

        var list = new TodoList
        {
            Title = "New List"
        };
        await TestApp.AddAsync(list);
        var listId = list.Id;

        await TestApp.SendAsync(new DeleteTodoListCommand(listId));

        list = await TestApp.FindAsync<TodoList>(listId);

        list.ShouldBeNull();
    }

    [Test]
    public async Task ShouldDeleteTodoItemsWhenDeletingTodoList()
    {
        var userId = await TestApp.RunAsDefaultUserAsync();

        var list = new TodoList
        {
            Title = "New List",
            CreatedBy = userId
        };
        await TestApp.AddAsync(list);

        var item = new TodoItem
        {
            ListId = list.Id,
            Title = "Task",
            CreatedBy = userId
        };
        await TestApp.AddAsync(item);

        await TestApp.SendAsync(new DeleteTodoListCommand(list.Id));

        var deletedList = await TestApp.FindAsync<TodoList>(list.Id);
        var deletedItem = await TestApp.FindAsync<TodoItem>(item.Id);

        deletedList.ShouldBeNull();
        deletedItem.ShouldBeNull();
    }

    [Test]
    public async Task ShouldNotDeleteTodoListOfAnotherUser()
    {
        var userId = await TestApp.RunAsDefaultUserAsync();

        var list = new TodoList
        {
            Title = "New List",
            CreatedBy = userId
        };
        await TestApp.AddAsync(list);

        var otheruserId = await TestApp.RunAsUserAsync("other@local", "Testing1234!", []);

        var command = new DeleteTodoListCommand(list.Id);

        var action = () => TestApp.SendAsync(command);

        await Should.ThrowAsync<NotFoundException>(action);
    }
}
