(function () {
    // Внутренние переменные, изолированные от других JS файлов
    let allNotes = [];
    let allTasks = [];


    document.addEventListener("DOMContentLoaded", () => {
        // Автоматическая загрузка заметок при старте
        loadNotes();
    });

    // === ЛОГИКА ПЕРЕКЛЮЧЕНИЯ ВКЛАДОК НАВИГАЦИИ ===
    const tabLinks = document.querySelectorAll('#mainNavigation [data-tab]');
    tabLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const sectionId = link.getAttribute('data-tab');

            tabLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const sections = document.querySelectorAll('.tab-content-section');
            sections.forEach(section => section.classList.add('d-none'));

            const activeSection = document.getElementById(sectionId);
            if (activeSection) {
                activeSection.classList.remove('d-none');
            }

            if (sectionId === 'calendarSection' && typeof window.initOrUpdateCalendar === 'function') {
                window.initOrUpdateCalendar();
            }
            if (sectionId === 'tasksSection') {
                loadTasks();
            }
        });
    });

    // === AJAX ЗАМЕТКИ ===
    async function loadNotes() {
        const container = document.getElementById('noteContainer');
        try {
            const response = await fetch('/api/notes');
            if (!response.ok) throw new Error('Ошибка данных');

            allNotes = await response.json();
            if (allNotes.length === 0) {
                container.innerHTML = '<div class="text-center text-muted">Заметок пока нет.</div>';
                return;
            }

            container.innerHTML = allNotes.map(note => `
            <div class="card mb-3 shadow-sm note-card" style="cursor: pointer;" id="note-${note.id}" onclick="openEditModal(${note.id}, event)">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title fw-bold mb-0" style="word-break: break-word; max-width: 85%;">${escapeHtml(note.title)}</h5>
                        <button onclick="event.stopPropagation(); deleteNote(${note.id})" class="btn btn-sm btn-outline-danger border-0 font-weight-bold" style="font-size: 1.2rem; line-height: 1; padding: 0 5px;" title="Удалить">&times;</button>
                    </div>
                    <small class="text-muted d-block mb-2">${note.createdAt ? new Date(note.createdAt).toLocaleString() : ''}</small>
                    <div class="card-text ql-editor p-0" style="max-height: 150px; overflow: hidden; text-overflow: ellipsis;">${note.content}</div>
                </div>
            </div>
        `).join('');
        } catch (error) { console.error(error); }
    }

    function openCreateModal() {
        document.getElementById('noteId').value = "";
        document.getElementById('noteTitle').value = "";
        if (quillEditor) quillEditor.setText('');
        document.getElementById('addNoteModalLabel').innerText = "Новая заметка";
        new bootstrap.Modal(document.getElementById('addNoteModal')).show();
    }

    function openEditModal(id, event) {
        const note = allNotes.find(n => n.id === id);
        if (!note) return;
        document.getElementById('noteId').value = note.id;
        document.getElementById('noteTitle').value = note.title;
        if (quillEditor) quillEditor.root.innerHTML = note.content;
        document.getElementById('addNoteModalLabel').innerText = "Редактировать заметку";
        new bootstrap.Modal(document.getElementById('addNoteModal')).show();
    }

    async function saveNote() {
        const id = document.getElementById('noteId').value;
        const title = document.getElementById('noteTitle').value.trim();
        if (!quillEditor) return;
        const content = quillEditor.root.innerHTML;
        if (!title || !quillEditor.getText().trim()) { alert("Заполните поля!"); return; }

        try {
            await fetch(id ? `/api/notes/${id}` : '/api/notes', {
                method: id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            });
            bootstrap.Modal.getInstance(document.getElementById('addNoteModal'))?.hide();
            loadNotes();
        } catch (error) { alert("Ошибка при сохранении заметки"); }
    }

    async function deleteNote(id) {
        if (!confirm("Вы уверены, что хотите удалить эту заметку?")) return;
        try {
            await fetch(`/api/notes/${id}`, { method: 'DELETE' });
            loadNotes();
        } catch (error) { alert("Не удалось удалить заметку"); }
    }

    // === AJAX ЗАДАЧИ ===
    async function loadTasks() {
        const container = document.getElementById('taskContainer');
        if (!container) return;
        try {
            const response = await fetch('/api/tasks');
            if (!response.ok) throw new Error();
            allTasks = await response.json();
            if (allTasks.length === 0) {
                container.innerHTML = '<div class="text-center text-muted">Задач пока нет.</div>';
                return;
            }
            container.innerHTML = allTasks.map(task => {
                const badges = ['<span class="badge bg-secondary">Низкий</span>', '<span class="badge bg-info text-dark">Средний</span>', '<span class="badge bg-danger">Высокий</span>'];
                return `
                <div class="card mb-2 shadow-sm ${task.isCompleted ? 'bg-light border-success' : ''}">
                    <div class="card-body d-flex align-items-center justify-content-between p-3">
                        <div class="d-flex align-items-center" style="flex:1; min-width:0;">
                            <input type="checkbox" class="form-check-input me-3" style="width:20px;height:20px;cursor:pointer;" ${task.isCompleted ? 'checked' : ''} onclick="toggleTaskStatus(${task.id})"/>
                            <div style="cursor:pointer;" onclick="openEditTaskModal(${task.id})">
                                <h6 class="mb-1 fw-bold ${task.isCompleted ? 'text-decoration-line-through text-muted' : ''}">${escapeHtml(task.title)}</h6>
                                <p class="small text-muted mb-0">${escapeHtml(task.description || 'Нет описания')}</p>
                            </div>
                        </div>
                        <div class="text-end ms-3">
                            <div class="mb-1">${badges[task.priority]}</div>                      
                            <small class="text-muted d-block mb-1">📅 ${task.dueDate ? new Date(task.dueDate).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : '—'}</small>
                            <button onclick="deleteTask(${task.id})" class="btn btn-sm btn-link text-danger p-0 border-0">Удалить</button>
                        </div>
                    </div>
                </div>`;
            }).join('');
        } catch (e) { console.error(e); }
    }

    function openCreateTaskModal() {
        document.getElementById('taskId').value = "";
        document.getElementById('taskTitle').value = "";
        document.getElementById('taskDescription').value = "";
        const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setMinutes(tomorrow.getMinutes() - tomorrow.getTimezoneOffset());
        document.getElementById('taskDueDate').value = tomorrow.toISOString().slice(0, 16);
        document.getElementById('taskPriority').value = "1";
        new bootstrap.Modal(document.getElementById('addTaskModal')).show();
    }

    function openEditTaskModal(id) {
        const task = allTasks.find(t => t.id === id);
        if (!task) return;
        document.getElementById('taskId').value = task.id;
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description || "";
        if (task.dueDate) document.getElementById('taskDueDate').value = task.dueDate.slice(0, 16);
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('addTaskModalLabel').innerText = "Редактировать задачу";
        new bootstrap.Modal(document.getElementById('addTaskModal')).show();
    }

    async function saveTask() {
        const id = document.getElementById('taskId').value;
        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const dueDate = document.getElementById('taskDueDate').value;
        const priority = parseInt(document.getElementById('taskPriority').value);
        if (!title) { alert("Укажите заголовок!"); return; }
        const taskData = { id: id ? parseInt(id) : 0, title: title, description: description, dueDate: dueDate, priority: priority, isCompleted: id ? allTasks.find(t => t.id === parseInt(id))?.isCompleted || false : false };

        try {
            await fetch(id ? `/api/tasks/${id}` : '/api/tasks', {
                method: id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });
            bootstrap.Modal.getInstance(document.getElementById('addTaskModal'))?.hide();
            loadTasks();
        } catch (e) { alert("Ошибка сохранения задачи"); }
    }

    async function toggleTaskStatus(id) {
        try {
            await fetch(`/api/tasks/${id}/toggle`, { method: 'PATCH' });
            loadTasks();
        } catch (e) { console.error(e); }
    }

    async function deleteTask(id) {
        if (!confirm("Вы уверены, что хотите удалить эту задачу?")) return;
        try {
            await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
            loadTasks();
        } catch (e) { console.error(e); }
    }

    function escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Глобальные биндинги
    window.openCreateTaskModal = openCreateTaskModal;
    window.openEditTaskModal = openEditTaskModal;
    window.saveTask = saveTask;
    window.toggleTaskStatus = toggleTaskStatus;
    window.deleteTask = deleteTask;
    window.openCreateModal = openCreateModal;
    window.openEditModal = openEditModal;
    window.saveNote = saveNote;
    window.deleteNote = deleteNote;
})();