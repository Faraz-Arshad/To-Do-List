const input = document.querySelector("input");
    const addBtn = document.querySelector(".add-btn");
    const taskList = document.querySelector(".task-list");
const totalTasksElement = document.getElementById("total-tasks");
const completedTasksElement = document.getElementById("completed-tasks");
const themeToggleButton = document.getElementById("theme-toggle");
const clearCompletedButton = document.getElementById("clear-completed");
const filterButtons = document.querySelectorAll(".filter-btn");

// Load tasks from localStorage on page load
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// Initialize the app
function initApp() {
    applySavedTheme();
    renderAllTasks();
    updateStats();
    showEmptyState();
}

function renderAllTasks() {
    taskList.innerHTML = "";
    tasks.forEach(task => {
        createTaskElement(task.text, task.completed, task.id);
    });
    applyFilter();
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Update statistics
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    
    totalTasksElement.textContent = total;
    completedTasksElement.textContent = completed;
    
    // Add animation to stats
    totalTasksElement.style.transform = 'scale(1.1)';
    completedTasksElement.style.transform = 'scale(1.1)';
    setTimeout(() => {
        totalTasksElement.style.transform = 'scale(1)';
        completedTasksElement.style.transform = 'scale(1)';
    }, 200);
}

// Show empty state when no tasks
function showEmptyState() {
    if (tasks.length === 0) {
        const emptyState = document.createElement("div");
        emptyState.className = "empty-state";
        emptyState.textContent = "No tasks yet. Add your first task above!";
        taskList.appendChild(emptyState);
    }
}

// Remove empty state
function removeEmptyState() {
    const emptyState = taskList.querySelector(".empty-state");
    if (emptyState) {
        emptyState.remove();
    }
}

// Generate unique ID for tasks
function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

    function createTask(text) {
        if (!text.trim()) return;

    const taskId = generateId();
    const newTask = {
        id: taskId,
        text: text.trim(),
        completed: false
    };
    
    tasks.push(newTask);
    saveTasks();
    
    createTaskElement(text.trim(), false, taskId);
    updateStats();
    removeEmptyState();
    applyFilterOnElement(taskId);
    
    input.value = "";
    input.focus();
}

function createTaskElement(text, completed, taskId) {
        const taskCard = document.createElement("div");
        taskCard.classList.add("task-card");
    taskCard.dataset.taskId = taskId;
    taskCard.setAttribute('draggable', 'true');

        const taskText = document.createElement("div");
        taskText.classList.add("task-text");
        taskText.textContent = text;
    
    if (completed) {
        taskText.classList.add("done");
    }

        const actions = document.createElement("div");
        actions.classList.add("action-buttons");

        const tickBtn = document.createElement("button");
        tickBtn.classList.add("tick-btn");
        tickBtn.innerHTML = "✔";
    tickBtn.title = completed ? "Mark as active" : "Mark as completed";
        tickBtn.addEventListener("click", () => {
        toggleTask(taskId, taskText);
        const t = tasks.find(t => t.id === taskId);
        tickBtn.title = t && t.completed ? "Mark as active" : "Mark as completed";
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("delete-btn");
        deleteBtn.innerHTML = "✖";
    deleteBtn.title = "Delete task";
        deleteBtn.addEventListener("click", () => {
        deleteTask(taskId, taskCard);
    });

    // Inline editing on double click
    taskText.addEventListener('dblclick', () => {
        startEditingTask(taskId, taskCard, taskText);
    });

    // Drag events
    taskCard.addEventListener('dragstart', () => {
        taskCard.classList.add('dragging');
    });
    taskCard.addEventListener('dragend', () => {
        taskCard.classList.remove('dragging');
        persistOrderFromDOM();
        });

        actions.appendChild(tickBtn);
        actions.appendChild(deleteBtn);
        taskCard.appendChild(taskText);
        taskCard.appendChild(actions);
        taskList.appendChild(taskCard);
}

function startEditingTask(taskId, taskCard, taskTextElement) {
    const currentText = taskTextElement.textContent;
    const inputEdit = document.createElement('input');
    inputEdit.className = 'task-edit-input';
    inputEdit.value = currentText;

    taskCard.replaceChild(inputEdit, taskTextElement);
    inputEdit.focus();
    inputEdit.select();

    const commit = () => {
        const newText = inputEdit.value.trim();
        const task = tasks.find(t => t.id === taskId);
        if (task && newText) {
            task.text = newText;
            saveTasks();
        }
        const restored = document.createElement('div');
        restored.className = 'task-text' + (task && task.completed ? ' done' : '');
        restored.textContent = newText || currentText;
        restored.addEventListener('dblclick', () => startEditingTask(taskId, taskCard, restored));
        taskCard.replaceChild(restored, inputEdit);
    };

    const cancel = () => {
        const restored = document.createElement('div');
        const task = tasks.find(t => t.id === taskId);
        restored.className = 'task-text' + (task && task.completed ? ' done' : '');
        restored.textContent = currentText;
        restored.addEventListener('dblclick', () => startEditingTask(taskId, taskCard, restored));
        taskCard.replaceChild(restored, inputEdit);
    };

    inputEdit.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') cancel();
    });
    inputEdit.addEventListener('blur', commit);
}

function toggleTask(taskId, taskTextElement) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        taskTextElement.classList.toggle("done");
        saveTasks();
        updateStats();
        applyFilterOnElement(taskId);
        
        // Add animation for completion
        if (task.completed) {
            taskTextElement.style.transform = 'scale(1.05)';
            setTimeout(() => {
                taskTextElement.style.transform = 'scale(1)';
            }, 200);
        }
    }
}

function deleteTask(taskId, taskCard) {
    // Add removal animation
    taskCard.classList.add("task-removed");
    
    setTimeout(() => {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        taskCard.remove();
        updateStats();
        
        // Show empty state if no tasks left
        if (tasks.length === 0) {
            showEmptyState();
        }
    }, 300);
}

// Drag-and-drop helpers
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - (box.top + box.height / 2);
        if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

taskList.addEventListener('dragover', (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(taskList, e.clientY);
    const dragging = document.querySelector('.task-card.dragging');
    if (!dragging) return;
    if (afterElement == null) {
        taskList.appendChild(dragging);
    } else {
        taskList.insertBefore(dragging, afterElement);
    }
});

function persistOrderFromDOM() {
    const idsInDom = [...taskList.querySelectorAll('.task-card')].map(el => el.dataset.taskId);
    tasks.sort((a, b) => idsInDom.indexOf(a.id) - idsInDom.indexOf(b.id));
    saveTasks();
}

// Filtering
function setFilter(filter) {
    currentFilter = filter;
    applyFilter();
}

function applyFilter() {
    const cards = taskList.querySelectorAll('.task-card');
    cards.forEach(card => {
        const id = card.dataset.taskId;
        applyFilterOnElement(id);
    });
}

function applyFilterOnElement(taskId) {
    const task = tasks.find(t => t.id === taskId);
    const card = taskList.querySelector(`.task-card[data-task-id="${taskId}"]`);
    if (!task || !card) return;
    let visible = true;
    if (currentFilter === 'active') visible = !task.completed;
    if (currentFilter === 'completed') visible = task.completed;
    card.style.display = visible ? '' : 'none';
}

// Clear completed
function clearCompleted() {
    const completedIds = tasks.filter(t => t.completed).map(t => t.id);
    tasks = tasks.filter(t => !t.completed);
    completedIds.forEach(id => {
        const card = taskList.querySelector(`.task-card[data-task-id="${id}"]`);
        if (card) card.remove();
    });
    saveTasks();
    updateStats();
    if (tasks.length === 0) showEmptyState();
}

// Theme
function applySavedTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
        document.body.classList.add('dark');
        updateThemeToggleLabel();
    } else {
        document.body.classList.remove('dark');
        updateThemeToggleLabel();
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeToggleLabel();
}

function updateThemeToggleLabel() {
    const isDark = document.body.classList.contains('dark');
    if (themeToggleButton) themeToggleButton.textContent = isDark ? 'Light mode' : 'Dark mode';
}

// Event listeners
    addBtn.addEventListener("click", () => {
        createTask(input.value);
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            createTask(input.value);
        }
    });

if (themeToggleButton) {
    themeToggleButton.addEventListener('click', toggleTheme);
}

if (clearCompletedButton) {
    clearCompletedButton.addEventListener('click', clearCompleted);
}

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        setFilter(btn.dataset.filter);
    });
});

// Initialize the app when page loads
document.addEventListener('DOMContentLoaded', initApp);

// Add some nice input focus effects
input.addEventListener('focus', () => {
    addBtn.style.transform = 'scale(1.02)';
});

input.addEventListener('blur', () => {
    addBtn.style.transform = 'scale(1)';
});