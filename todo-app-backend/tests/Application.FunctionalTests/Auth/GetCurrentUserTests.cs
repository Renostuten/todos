using System.Net;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using todo_app_backend.Application.Auth.Common.Models;
using todo_app_backend.Infrastructure.Identity;

namespace todo_app_backend.Application.FunctionalTests.Auth;

public class GetCurrentUserTests : TestBase
{
    [Test]
    public async Task ShouldReturnCurrentUser()
    {
        var userManager = MockUserManager();

        var users = new List<ApplicationUser>
        {
            new()
            {
                Id = "local-user-id",
                UserName = "user@test.com",
                Email = "user@test.com",
                EntraObjectId = "entra-123"
            }
        };

        userManager
            .Setup(x => x.Users)
            .Returns(new TestAsyncEnumerable<ApplicationUser>(users));

        var httpContext = CreateEasyAuthHttpContext(
            email: "user@test.com",
            entraObjectId: "entra-123");

        var result = await Web.Endpoints.Auth.GetCurrentUser(userManager.Object, httpContext);

        var okResult = result.ShouldBeOfType<Ok<UserLoginResponse>>();

        okResult.Value.ShouldNotBeNull();
        okResult.Value!.Email.ShouldBe("user@test.com");
    }

    [Test]
    public async Task ShouldReturnUnauthorized_WhenEasyAuthHeaderMissing()
    {
        var userManager = MockUserManager();

        var httpContext = new DefaultHttpContext();

        var result = await Web.Endpoints.Auth.GetCurrentUser(
            userManager.Object,
            httpContext);

        result.ShouldBeOfType<UnauthorizedHttpResult>();
    }

    [Test]
    public async Task ShouldReturnUnauthorized_WhenEmailClaimMissing()
    {
        var userManager = MockUserManager();

        var httpContext = CreateEasyAuthHttpContext(
            email: null,
            entraObjectId: "entra-123");

        var result = await Web.Endpoints.Auth.GetCurrentUser(
            userManager.Object,
            httpContext);

        result.ShouldBeOfType<UnauthorizedHttpResult>();
    }

    [Test]
    public async Task ShouldReturnUnauthorized_WhenEntraObjectIdClaimMissing()
    {
        var userManager = MockUserManager();

        var httpContext = CreateEasyAuthHttpContext(
            email: "user@test.com",
            entraObjectId: null);

        var result = await Web.Endpoints.Auth.GetCurrentUser(
            userManager.Object,
            httpContext);

        result.ShouldBeOfType<UnauthorizedHttpResult>();
    }

    [Test]
    public async Task ShouldReturnConflict_WhenUserDoesNotExist()
    {
        var userManager = MockUserManager();

        var users = new List<ApplicationUser>();

        userManager
            .Setup(x => x.Users)
            .Returns(new TestAsyncEnumerable<ApplicationUser>(users));

        var httpContext = CreateEasyAuthHttpContext(
            email: "user@test.com",
            entraObjectId: "entra-123");

        var result = await Web.Endpoints.Auth.GetCurrentUser(
            userManager.Object,
            httpContext);

        var conflictResult = result.ShouldBeAssignableTo<IStatusCodeHttpResult>();

        conflictResult.StatusCode.ShouldBe(StatusCodes.Status409Conflict);
    }

    private static DefaultHttpContext CreateEasyAuthHttpContext(
        string? email = "test@local",
        string? entraObjectId = "entra-object-id")
    {
        var httpContext = new DefaultHttpContext();

        var claims = new List<object>();

        if (email is not null)
        {
            claims.Add(new
            {
                type = ClaimTypes.Email,
                value = email
            });
        }

        if (entraObjectId is not null)
        {
            claims.Add(new
            {
                type = ClaimTypes.NameIdentifier,
                value = entraObjectId
            });
        }

        var principal = new
        {
            authTyp = "aad",
            nameTyp = "name",
            roleTyp = "roles",
            claims
        };

        var json = JsonSerializer.Serialize(principal);

        var encoded = Convert.ToBase64String(Encoding.UTF8.GetBytes(json));

        httpContext.Request.Headers["X-MS-CLIENT-PRINCIPAL"] = encoded;

        return httpContext;
    }

    private static Mock<UserManager<ApplicationUser>> MockUserManager()
    {
        var store = new Mock<IUserStore<ApplicationUser>>();

        return new Mock<UserManager<ApplicationUser>>(
            store.Object,
            null!,
            null!,
            null!,
            null!,
            null!,
            null!,
            null!,
            null!);
    }
}