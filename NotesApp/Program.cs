using Microsoft.EntityFrameworkCore;
using NotesApp.Data;
using NotesApp.Models;
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();

builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlite("DataSource = notes.db"));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}


    if (!app.Environment.IsDevelopment())
    {
        app.UseExceptionHandler("/Home/Error");
        app.UseHsts();
    }

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

//Эндпоинты для Заметок

app.MapGet("/api/notes", async (AppDbContext db) =>
Results.Ok(await db.Notes.OrderByDescending(n => n.CreatedAt).ToListAsync()));

app.MapPost("/api/notes", async (Note newNote, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(newNote.Title))
    {
        return Results.BadRequest("Ne moget bit' pustim TVAR'!");
    }

    newNote.CreatedAt = DateTime.Now;
    db.Notes.Add(newNote);
    await db.SaveChangesAsync();

    return Results.Json(newNote);
});

app.MapPut("/api/notes/{id:int}", async (int id, Note updateNote, AppDbContext db) =>
{
    var note = await db.Notes.FindAsync(id);
    if (note is null) return Results.NotFound();


    if (string.IsNullOrWhiteSpace(updateNote.Title))
    {
        return Results.BadRequest("Ne moget bit' pustim TVAR'!");
    }

    note.Title = updateNote.Title;
    note.Content = updateNote.Content;
    note.CreatedAt = DateTime.Now;


    await db.SaveChangesAsync();

    return Results.Ok(note);
});

app.MapDelete("/api/notes/{id:int}", async (int id, AppDbContext db) =>
{
    var noteToDelete = await db.Notes.FindAsync(id);
    if (noteToDelete is null) return Results.NotFound();
    

    db.Notes.Remove(noteToDelete);
    await db.SaveChangesAsync();
    return Results.Ok();
});

//Эндпоинты для Задач

app.MapGet("/api/tasks", async (AppDbContext db) =>
{
    var tasks = await db.TodoTasks
    .OrderBy(t => t.IsCompleted)
    .ThenBy(t => t.DueDate)
    .ToListAsync();

    return Results.Ok(await db.TodoTasks.OrderByDescending(n => n.CreatedAt).ToListAsync());
});


app.MapPost("/api/tasks", async (TodoTask newTask, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(newTask.Title))
    {
        return Results.BadRequest("Ne moget bit' pustim TVAR'!");
    }

    newTask.CreatedAt = DateTime.Now;
    db.TodoTasks.Add(newTask);
    await db.SaveChangesAsync();

    return Results.Json(newTask);
});

app.MapPut("/api/tasks/{id:int}", async (int id, TodoTask updateTask, AppDbContext db) =>
{
    var task = await db.TodoTasks.FindAsync(id);
    if (task is null) return Results.NotFound();


    if (string.IsNullOrWhiteSpace(updateTask.Title))
    {
        return Results.BadRequest("Ne moget bit' pustim TVAR'!");
    }

    task.Title = updateTask.Title;
    task.Description = updateTask.Description;
    task.DueDate = updateTask.DueDate;
    task.Priority = updateTask.Priority;
    task.IsCompleted = updateTask.IsCompleted;


    await db.SaveChangesAsync();

    return Results.Ok(task);
});

app.MapPatch("/api/tasks/{id:int}/toggle", async (int id, AppDbContext db) =>
{
    var task = await db.TodoTasks.FindAsync(id);
    if (task is null) return Results.NotFound();

    task.IsCompleted = !task.IsCompleted;
    
    await db.SaveChangesAsync();

    return Results.Ok(task);
});

app.MapDelete("/api/tasks/{id:int}", async (int id, AppDbContext db) =>
{
    var taskToDelete = await db.TodoTasks.FindAsync(id);
    if (taskToDelete is null) return Results.NotFound();


    db.TodoTasks.Remove(taskToDelete);
    await db.SaveChangesAsync();
    return Results.Ok();
});




app.Run();
