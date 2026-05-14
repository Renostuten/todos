using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace todo_app_backend.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddEntraObjectId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "GoogleSubject",
                table: "AspNetUsers",
                newName: "EntraObjectId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "EntraObjectId",
                table: "AspNetUsers",
                newName: "GoogleSubject");
        }
    }
}
