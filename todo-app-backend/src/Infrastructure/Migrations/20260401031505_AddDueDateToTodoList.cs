using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace todo_app_backend.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDueDateToTodoList : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DueDate",
                table: "TodoLists",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DueDate",
                table: "TodoLists");
        }
    }
}
