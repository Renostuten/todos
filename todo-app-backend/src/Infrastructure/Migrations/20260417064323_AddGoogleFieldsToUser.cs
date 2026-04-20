using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace todo_app_backend.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddGoogleFieldsToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GoogleEmail",
                table: "AspNetUsers",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GoogleSubject",
                table: "AspNetUsers",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GoogleEmail",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "GoogleSubject",
                table: "AspNetUsers");
        }
    }
}
