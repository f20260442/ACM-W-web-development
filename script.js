document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const dateInput = document.getElementById('date-input');
    const priorityInput = document.getElementById('priority-input');
    const addBtn = document.getElementById('add-btn');
    const taskList = document.getElementById('task-list');
    const taskCountText = document.getElementById('task-count');
    const progressBar = document.getElementById('progress-bar');
    const clearBtn = document.getElementById('clear-completed-btn');

    // Return early if not on the app page
    if (!taskList) return;

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let draggedItemIndex = null;

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    }

    function renderTasks() {
        taskList.innerHTML = '';
        let completedCount = 0;

        tasks.forEach((task, index) => {
            if (task.completed) completedCount++;

            const li = document.createElement('li');
            li.className = `priority-${task.priority} ${task.completed ? 'completed' : ''}`;
            li.draggable = true;
            li.dataset.index = index;

            li.innerHTML = `
                <div class="task-info">
                    <input type="checkbox" class="cb-complete" ${task.completed ? 'checked' : ''}>
                    <span>${escapeHTML(task.text)}</span>
                    ${task.dueDate ? `<span class="task-meta">📅 ${task.dueDate}</span>` : ''}
                </div>
                <div class="task-actions">
                    <button class="btn-edit" title="Edit Task">✏️</button>
                    <button class="btn-delete" title="Delete Task">❌</button>
                </div>
            `;

            // Action listeners
            li.querySelector('.cb-complete').addEventListener('change', () => toggleComplete(index));
            li.querySelector('.btn-delete').addEventListener('click', () => deleteTask(index));
            li.querySelector('.btn-edit').addEventListener('click', () => editTask(index));

            // Drag and Drop listeners
            li.addEventListener('dragstart', handleDragStart);
            li.addEventListener('dragover', handleDragOver);
            li.addEventListener('drop', handleDrop);
            li.addEventListener('dragend', handleDragEnd);

            taskList.appendChild(li);
        });

        updateProgress(completedCount, tasks.length);
    }

    function addTask() {
        const text = taskInput.value.trim();
        if (!text) return;

        tasks.push({
            text,
            dueDate: dateInput.value,
            priority: priorityInput.value,
            completed: false
        });

        taskInput.value = '';
        dateInput.value = '';
        saveTasks();
    }

    function toggleComplete(index) {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
    }

    function deleteTask(index) {
        tasks.splice(index, 1);
        saveTasks();
    }

    function editTask(index) {
        const newText = prompt('Edit task text:', tasks[index].text);
        if (newText !== null && newText.trim() !== '') {
            tasks[index].text = newText.trim();
            saveTasks();
        }
    }

    function updateProgress(completed, total) {
        taskCountText.textContent = `${completed} of ${total} tasks done`;
        const percentage = total === 0 ? 0 : (completed / total) * 100;
        progressBar.style.width = `${percentage}%`;
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    // Drag and Drop implementation
    function handleDragStart(e) {
        draggedItemIndex = +e.target.dataset.index;
        e.target.classList.add('dragging');
    }

    function handleDragOver(e) {
        e.preventDefault(); 
    }

    function handleDrop(e) {
        e.preventDefault();
        const targetElement = e.target.closest('li');
        if (!targetElement) return;

        const targetIndex = +targetElement.dataset.index;
        
        if (draggedItemIndex !== null && draggedItemIndex !== targetIndex) {
            const draggedTask = tasks.splice(draggedItemIndex, 1)[0];
            tasks.splice(targetIndex, 0, draggedTask);
            saveTasks();
        }
    }

    function handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    // Event listeners
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    clearBtn.addEventListener('click', () => {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
    });

    // Initial render
    renderTasks();
});