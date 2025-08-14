// To-Do List Application with Local Storage
class TodoList {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
        this.taskInput = document.getElementById('taskInput');
        this.addBtn = document.getElementById('addBtn');
        this.tasksContainer = document.getElementById('tasksContainer');
        this.totalTasksElement = document.getElementById('totalTasks');
        this.completedTasksElement = document.getElementById('completedTasks');
        
        this.init();
    }
    
    init() {
        // Event listeners
        this.addBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (dets) => {
            if (dets.key === 'Enter') {
                this.addTask();
            }
        });
        
        // Load existing tasks
        this.renderTasks();
        this.updateStats();
        
        // Show empty state if no tasks
        this.showEmptyState();
    }
    
    addTask() {
        const taskText = this.taskInput.value.trim();
        
        if (taskText === '') {
            this.showNotification('Please enter a task!', 'error');
            return;
        }
        
        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.tasks.unshift(task); // Add to beginning of array
        this.saveToLocalStorage();
        this.renderTasks();
        this.updateStats();
        this.showEmptyState();
        
        // Clear input and focus
        this.taskInput.value = '';
        this.taskInput.focus();
        
        // Show success notification
        this.showNotification('Task added successfully!', 'success');
    }
    
    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveToLocalStorage();
            this.renderTasks();
            this.updateStats();
        }
    }
    
    deleteTask(taskId) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            this.tasks.splice(taskIndex, 1);
            this.saveToLocalStorage();
            this.renderTasks();
            this.updateStats();
            this.showEmptyState();
            this.showNotification('Task deleted!', 'info');
        }
    }
    
    renderTasks() {
        this.tasksContainer.innerHTML = '';
        
        if (this.tasks.length === 0) {
            return;
        }
        
        this.tasks.forEach(task => {
            const taskCard = this.createTaskCard(task);
            this.tasksContainer.appendChild(taskCard);
        });
    }
    
    createTaskCard(task) {
        const taskCard = document.createElement('div');
        taskCard.className = `task-card ${task.completed ? 'completed' : ''}`;
        taskCard.dataset.taskId = task.id;
        
        taskCard.innerHTML = `
            <div class="task-content">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="todoList.toggleTask(${task.id})"></div>
                <div class="task-text">${this.escapeHtml(task.text)}</div>
                <div class="task-actions">
                    <button class="delete-btn" onclick="todoList.deleteTask(${task.id})">×</button>
                </div>
            </div>
        `;
        
        return taskCard;
    }
    
    showEmptyState() {
        if (this.tasks.length === 0) {
            this.tasksContainer.innerHTML = `
                <div class="empty-state">
                    <h3>✨ No tasks yet!</h3>
                    <p>Add your first task above to get started</p>
                </div>
            `;
        }
    }
    
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        
        this.totalTasksElement.textContent = total;
        this.completedTasksElement.textContent = completed;
    }
    
    saveToLocalStorage() {
        localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#28a745';
                break;
            case 'error':
                notification.style.backgroundColor = '#dc3545';
                break;
            case 'info':
                notification.style.backgroundColor = '#17a2b8';
                break;
            default:
                notification.style.backgroundColor = '#6c757d';
        }
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.todoList = new TodoList();
});

// Add some additional features
document.addEventListener('DOMContentLoaded', () => {
    // Add keyboard shortcuts
    document.addEventListener('keydown', (dets) => {
        // Ctrl/Cmd + Enter to add task
        if ((dets.ctrlKey || dets.metaKey) && dets.key === 'Enter') {
            dets.preventDefault();
            todoList.addTask();
        }
        
        // Escape to clear input
        if (dets.key === 'Escape') {
            todoList.taskInput.value = '';
            todoList.taskInput.blur();
        }
    });
    
    // Add input validation
    todoList.taskInput.addEventListener('input', (dets) => {
        const maxLength = 200;
        if (dets.target.value.length > maxLength) {
            dets.target.value = dets.target.value.substring(0, maxLength);
            todoList.showNotification(`Task text limited to ${maxLength} characters`, 'info');
        }
    });
});
