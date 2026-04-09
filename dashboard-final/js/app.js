// Mission Control Dashboard - Main Application Logic

let dashboardData = null;
let currentWorkspace = 'main';
const API_BASE = ''; // Use same origin for now

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    initializeViews();
    initializeNavigation();
    initializeFilters();
});

// Load data from API
async function loadData() {
    try {
        // Try API first, fall back to static data
        try {
            const response = await fetch('api/data');
            if (response.ok) {
                dashboardData = await response.json();
                console.log('📡 Loaded data from API');
                renderWorkspaces();
                return;
            }
        } catch (e) {
            console.log('📄 API not available, using static data');
        }
        
        // Fallback to static data
        const response = await fetch('data.json');
        dashboardData = await response.json();
        renderWorkspaces();
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    }
}

// Render workspace list in sidebar
function renderWorkspaces() {
    const workspaceList = document.getElementById('workspaceList');
    workspaceList.innerHTML = '';
    
    dashboardData.workspaces.forEach(workspace => {
        const item = document.createElement('div');
        item.className = `workspace-item ${workspace.id === currentWorkspace ? 'active' : ''}`;
        item.innerHTML = `
            <span class="workspace-icon">${workspace.icon}</span>
            <span class="workspace-name">${workspace.name}</span>
            <span class="workspace-badge">${dashboardData.projects.filter(p => p.workspace === workspace.id).length}</span>
        `;
        item.addEventListener('click', () => switchWorkspace(workspace.id));
        workspaceList.appendChild(item);
    });
    
    // Update project filter
    const projectFilter = document.getElementById('projectFilter');
    projectFilter.innerHTML = '<option value="all">All Projects</option>';
    dashboardData.projects.forEach(project => {
        if (project.workspace === currentWorkspace || currentWorkspace === 'all') {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            projectFilter.appendChild(option);
        }
    });
    
    updateBreadcrumb();
}

// Switch workspace
function switchWorkspace(workspaceId) {
    currentWorkspace = workspaceId;
    renderWorkspaces();
    renderTasks();
    renderAgents();
}

// Initialize navigation
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const view = item.dataset.view;
            switchView(view);
            
            // Update active state
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

// Switch between views
function switchView(viewName) {
    // Update breadcrumb
    document.getElementById('currentView').textContent = viewName.charAt(0).toUpperCase() + viewName.slice(1);
    
    // Show correct view
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    document.getElementById(`${viewName}View`).classList.add('active');
    
    // Render content for this view
    switch(viewName) {
        case 'tasks': renderTasks(); break;
        case 'agents': renderAgents(); break;
        case 'office': renderOffice(); break;
        case 'calendar': renderCalendar(); break;
        case 'documents': renderDocuments(); break;
        case 'fellowship': renderFellowship(); break;
    }
}

// Initialize view rendering
function initializeViews() {
    // Initial render of default view
    renderTasks();
}

// Initialize filters
function initializeFilters() {
    const projectFilter = document.getElementById('projectFilter');
    projectFilter.addEventListener('change', (e) => {
        renderTasks(e.target.value);
    });
    
    const docSearch = document.getElementById('docSearch');
    docSearch.addEventListener('input', (e) => {
        filterDocuments(e.target.value, document.getElementById('docCategory').value);
    });
    
    const docCategory = document.getElementById('docCategory');
    docCategory.addEventListener('change', (e) => {
        filterDocuments(docSearch.value, e.target.value);
    });
}

// Render Tasks
function renderTasks(projectFilter = 'all') {
    const taskColumns = document.getElementById('taskColumns');
    taskColumns.innerHTML = '';
    
    const statusColumns = [
        { id: 'todo', title: 'To Do', tasks: [] },
        { id: 'in-progress', title: 'In Progress', tasks: [] },
        { id: 'done', title: 'Done', tasks: [] }
    ];
    
    // Get projects for current workspace
    const workspaceProjects = dashboardData.workspaces.find(w => w.id === currentWorkspace)?.projects || [];
    const allProjects = dashboardData.projects.filter(p => workspaceProjects.includes(p.id));
    
    allProjects.forEach(project => {
        project.tasks.forEach(task => {
            if (projectFilter === 'all' || projectFilter === project.id) {
                const column = statusColumns.find(c => c.id === task.status);
                if (column) {
                    column.tasks.push({ ...task, projectName: project.name, projectId: project.id });
                }
            }
        });
    });
    
    statusColumns.forEach(column => {
        const colDiv = document.createElement('div');
        colDiv.className = 'task-column';
        colDiv.innerHTML = `
            <div class="column-header">
                <span class="column-title">${column.title}</span>
                <span class="column-count">${column.tasks.length}</span>
            </div>
        `;
        
        column.tasks.forEach(task => {
            const taskCard = document.createElement('div');
            taskCard.className = 'task-card';
            taskCard.dataset.project = task.projectId || task.projectName?.toLowerCase().replace(' ', '-');
            taskCard.dataset.taskId = task.id;
            taskCard.innerHTML = `
                <div class="task-title">${task.title}</div>
                <div class="task-meta">
                    <span>${task.projectName}</span>
                    <span class="task-priority priority-${task.priority}">${task.priority}</span>
                </div>
            `;
            colDiv.appendChild(taskCard);
        });
        
        taskColumns.appendChild(colDiv);
    });
}

// Render Agents
function renderAgents() {
    const agentGrid = document.getElementById('agentGrid');
    agentGrid.innerHTML = '';
    
    const workspaceProjects = dashboardData.workspaces.find(w => w.id === currentWorkspace)?.projects || [];
    const relevantAgents = Object.entries(dashboardData.agents)
        .filter(([id, agent]) => workspaceProjects.includes(agent.project));
    
    const emojiMap = {
        'research-lead': '🔍',
        'outreach-bot': '📨',
        'data-analyzer': '📊',
        'ion-assistant': '📱'
    };
    
    const statusMap = {
        'idle': 'status-idle',
        'working': 'status-working',
        'waiting': 'status-waiting'
    };
    
    relevantAgents.forEach(([id, agent]) => {
        const card = document.createElement('div');
        card.className = 'agent-card';
        card.innerHTML = `
            <div class="agent-header">
                <div class="agent-avatar">${emojiMap[id] || '🤖'}</div>
                <div class="agent-info">
                    <h3>${agent.name}</h3>
                    <span>${agent.project}</span>
                </div>
                <div class="agent-status-badge ${statusMap[agent.status]}">${agent.status}</div>
            </div>
            <div class="agent-task">${agent.task || 'No active task'}</div>
        `;
        agentGrid.appendChild(card);
    });
}

// Render Office (placeholder - pixel art style)
function renderOffice() {
    // Office is already rendered in HTML, just update status
    const workspaceProjects = dashboardData.workspaces.find(w => w.id === currentWorkspace)?.projects || [];
    
    document.querySelectorAll('.office-desk').forEach(desk => {
        const agentId = desk.dataset.agent;
        const agent = dashboardData.agents[agentId];
        
        if (agent && workspaceProjects.includes(agent.project)) {
            const statusEl = desk.querySelector('.desk-status');
            statusEl.className = `desk-status ${agent.status}`;
        }
    });
}

// Render Calendar
function renderCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';
    
    const today = new Date();
    const daysInWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Generate 7 days starting from today
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayDiv = document.createElement('div');
        dayDiv.className = `calendar-day ${i === 0 ? 'today' : ''}`;
        
        const events = dashboardData.calendar.filter(c => c.date === dateStr);
        
        dayDiv.innerHTML = `
            <div class="calendar-day-number">${daysInWeek[date.getDay()]} ${date.getDate()}</div>
            ${events.map(e => `<div class="calendar-event event-${e.type}">${e.title}</div>`).join('')}
        `;
        
        calendarGrid.appendChild(dayDiv);
    }
}

// Render Documents
function renderDocuments(filter = 'all', search = '') {
    const docGrid = document.getElementById('docGrid');
    docGrid.innerHTML = '';
    
    let docs = dashboardData.documents;
    
    // Filter by workspace
    const workspaceProjects = dashboardData.workspaces.find(w => w.id === currentWorkspace)?.projects || [];
    docs = docs.filter(d => workspaceProjects.includes(d.project));
    
    // Filter by category
    if (filter && filter !== 'all') {
        docs = docs.filter(d => d.category === filter);
    }
    
    // Filter by search
    if (search) {
        docs = docs.filter(d => d.title.toLowerCase().includes(search.toLowerCase()));
    }
    
    docs.forEach(doc => {
        const card = document.createElement('div');
        card.className = 'doc-card';
        card.innerHTML = `
            <div class="doc-title">${doc.title}</div>
            <div class="doc-meta">${doc.project} • ${doc.date}</div>
            <span class="doc-category">${doc.category}</span>
        `;
        docGrid.appendChild(card);
    });
}

// Filter documents helper
function filterDocuments(search, category) {
    renderDocuments(category, search);
}

// Render Fellowship
function renderFellowship() {
    const teamGrid = document.getElementById('teamGrid');
    teamGrid.innerHTML = '';
    
    const emojiMap = {
        'research-lead': '🔍',
        'outreach-bot': '📨',
        'data-analyzer': '📊',
        'ion-assistant': '📱'
    };
    
    const statusMap = {
        'idle': '🟢',
        'working': '🔵',
        'waiting': '🟡'
    };
    
    Object.entries(dashboardData.agents).forEach(([id, agent]) => {
        const card = document.createElement('div');
        card.className = 'team-card';
        card.innerHTML = `
            <div class="team-avatar">${emojiMap[id] || '🤖'}</div>
            <div class="team-info">
                <h3>${agent.name}</h3>
                <span>${agent.project} • ${statusMap[agent.status]} ${agent.status}</span>
            </div>
        `;
        teamGrid.appendChild(card);
    });
}

// Update breadcrumb
function updateBreadcrumb() {
    const workspace = dashboardData.workspaces.find(w => w.id === currentWorkspace);
    document.getElementById('currentWorkspace').textContent = workspace ? workspace.name : 'All';
}

// Export for potential future use
window.dashboard = {
    switchWorkspace,
    switchView,
    getData: () => dashboardData
};
// Chat functionality - sends to Telegram via backend API
let chatHistory = [];

async function sendChatMessage(text) {
    if (!text.trim()) return;
    
    // Add user message
    addChatMessage(text, 'user');
    chatHistory.push({ role: 'user', content: text });
    
    // Clear input
    document.getElementById('chatInput').value = '';
    
    // Show typing indicator
    const typingMsg = document.createElement('div');
    typingMsg.className = 'chat-message system typing';
    typingMsg.id = 'typingIndicator';
    typingMsg.innerHTML = `
        <div class="message-avatar">⚡</div>
        <div class="message-content">
            <div class="message-text">Typing...</div>
        </div>
    `;
    document.getElementById('chatMessages').appendChild(typingMsg);
    
    // Send to backend
    try {
        const response = await fetch('api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, history: chatHistory })
        });
        
        // Remove typing indicator
        const typing = document.getElementById('typingIndicator');
        if (typing) typing.remove();
        
        if (response.ok) {
            const data = await response.json();
            addChatMessage(data.response, 'system');
            chatHistory.push({ role: 'assistant', content: data.response });
        } else {
            // Fallback: simulate response if API not available
            addChatMessage("I received your message! For full chat functionality, this dashboard needs to be connected to my backend. Deploy the API version for real-time chat.", 'system');
        }
    } catch (error) {
        // Remove typing indicator
        const typing = document.getElementById('typingIndicator');
        if (typing) typing.remove();
        
        // Fallback response
        addChatMessage("Message sent! (Local mode - full AI responses require API connection)", 'system');
    }
}

function addChatMessage(text, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    messageDiv.innerHTML = `
        <div class="message-avatar">${sender === 'user' ? '👤' : '⚡'}</div>
        <div class="message-content">
            <div class="message-sender">${sender === 'user' ? 'You' : 'Claw'}</div>
            <div class="message-text">${text}</div>
            <div class="message-time">${time}</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Initialize chat
function initializeChat() {
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');
    
    chatSend.addEventListener('click', () => {
        sendChatMessage(chatInput.value);
    });
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage(chatInput.value);
        }
    });
}

// Render Chat
function renderChat() {
    initializeChat();
}

// Override switchView to include chat
const originalSwitchView = switchView;
switchView = function(viewName) {
    originalSwitchView(viewName);
    if (viewName === 'chat') {
        renderChat();
    }
};
