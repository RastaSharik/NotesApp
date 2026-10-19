namespace NotesApp.Models
{

    public enum TaskPriority 
    { 
        Low = 0,
        Middle = 1,
        High = 2 
    }

    public class TodoTask
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsCompleted { get; set; } = false;
        public DateTime DueDate { get; set; } = DateTime.Now.AddDays(1);
        public TaskPriority Priority { get; set; } = TaskPriority.Middle;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
