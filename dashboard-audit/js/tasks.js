// Task Management - Add click-to-edit functionality

let editingTaskId = null;

// Initialize task editing
function initializeTaskEditing() {
    // Add click handlers to task cards
    document.addEventListener('click', (e) => {
        const taskCard = e.target.closest('.task-card');
        if (taskCard && !e.target.closest('.task-actions')) {
            const projectId = taskCard.dataset.project;
            const taskId = parseInt(taskCard.dataset.taskId);
            openTaskEditor(projectId, taskId);
        }
    });
}

function openTaskEditor(projectId, taskId) {
    const project = dashboardData.projects.find(p => p.id === projectId);
    if (!project) return;
    
    const task = project.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'task-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Edit Task</h3>
                <button class="modal-close">✕</button>
            </div>
            <div class="modal-body">
                <label>Title</label>
                <input type="text" id="editTaskTitle" value="${task.title}" class="modal-input">
                
                <label>Status</label>
                <select id="editTaskStatus" class="modal-select">
                    <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>To Do</option>
                    <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                    <option value="done" ${task.status === 'done' ? 'selected' : ''}>Done</option>
                </select>
                
                <label>Priority</label>
                <select id="editTaskPriority" class="modal-select">
                    <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
                    <option value="medium" ${task.status === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
                </select>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary modal-cancel">Cancel</button>
                <button class="btn-primary" id="saveTaskBtn">Save</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event handlers
    modal.querySelector('.modal-close').onclick = () => closeModal(modal);
    modal.querySelector('.modal-cancel').onclick = () => closeModal(modal);
    modal.querySelector('.modal-overlay').onclick = () => closeModal(modal);
    modal.querySelector('#saveTaskBtn').onclick = () => {
        saveTask(projectId, taskId, modal);
    };
}

function closeModal(modal) {
    modal.remove();
}

function saveTask(projectId, taskId, modal) {
    const newTitle = document.getElementById('editTaskTitle').value;
    const newStatus = document.getElementById('editTaskStatus').value;
    const newPriority = document.getElementById('editTaskPriority').value;
    
    // Update data
    const project = dashboardData.projects.find(p => p.id === projectId);
    const task = project.tasks.find(t => t.id === taskId);
    task.title = newTitle;
    task.status = newStatus;
    task.priority = newPriority;
    
    // Save to localStorage (for demo - in real version, would POST to API)
    saveTasksToStorage();
    
    // Re-render
    renderTasks();
    closeModal(modal);
    
    // Show feedback
    showNotification('Task saved!', 'success');
}

function saveTasksToStorage() {
    localStorage.setItem('dashboard_tasks', JSON.stringify(dashboardData.projects));
}

function loadTasksFromStorage() {
    const stored = localStorage.getItem('dashboard_tasks');
    if (stored) {
        const storedProjects = JSON.parse(stored);
        storedProjects.forEach(storedProj => {
            const proj = dashboardData.projects.find(p => p.id === storedProj.id);
            if (proj) {
                proj.tasks = storedProj.tasks;
            }
        });
    }
}

function showNotification(message, type) {
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
}

// Add modal styles to CSS
const modalStyles = `
.task-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.7);
}

.modal-content {
    position: relative;
    background: var(--bg-panel);
    border-radius: 12px;
    border: 1px solid var(--border-color);
    width: 400px;
    max-width: 90%;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
    font-size: 18px;
    font-weight: 600;
}

.modal-close {
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 20px;
    cursor: pointer;
}

.modal-body {
    padding: 20px;
}

.modal-body label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 8px;
    margin-top: 16px;
}

.modal-body label:first-child {
    margin-top: 0;
}

.modal-input, .modal-select {
    width: 100%;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 10px 14px;
    border-radius: 8px;
    font-family: var(--font-sans);
    font-size: 14px;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 20px;
    border-top: 1px solid var(--border-color);
}

.btn-secondary {
    background: var(--bg-card);
    color: var(--text-secondary);
    border: 1px solid var(--border-color);
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
}

.notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 2000;
}

.notification.success {
    background: var(--accent-secondary);
    color: white;
}
`;

// Inject styles
const styleEl = document.createElement('style');
styleEl.textContent = modalStyles;
document.head.appendChild(styleEl);

// Initialize
initializeTaskEditing();
