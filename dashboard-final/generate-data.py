#!/usr/bin/env python3
"""
Generate dashboard data from project files.
Run this locally to update data.json before deploying.
"""

import json
import os
from datetime import datetime, timedelta
from pathlib import Path

# Configure your workspace path here
WORKSPACE_PATH = os.path.expanduser("~/openclaw-workspace")
PROJECTS_PATH = f"{WORKSPACE_PATH}/projects" if os.path.exists(f"{WORKSPACE_PATH}/projects") else "./projects"

def get_projects():
    """Scan project directories"""
    projects = []
    
    # Lead Lasso
    lead_lasso_path = f"{PROJECTS_PATH}/lead-lasso"
    if os.path.exists(lead_lasso_path):
        tasks = extract_tasks_from_project(lead_lasso_path)
        projects.append({
            "id": "lead-lasso",
            "name": "Lead Lasso",
            "workspace": "main",
            "status": "active",
            "description": "AI lead generation for construction SMEs",
            "tasks": tasks,
            "agents": ["research-lead", "outreach-bot"]
        })
    
    # Sheet Show
    sheet_show_path = f"{PROJECTS_PATH}/sheet-show"
    if os.path.exists(sheet_show_path):
        tasks = extract_tasks_from_project(sheet_show_path)
        projects.append({
            "id": "sheet-show",
            "name": "Sheet Show",
            "workspace": "main",
            "status": "active",
            "description": "AI data analysis & reporting service",
            "tasks": tasks,
            "agents": ["data-analyzer"]
        })
    
    # Ion CRM
    ion_crm_path = f"{PROJECTS_PATH}/ion-crm"
    if os.path.exists(ion_crm_path):
        projects.append({
            "id": "ion-crm",
            "name": "Ion Mobile Homes",
            "workspace": "ion",
            "status": "active",
            "description": "Lead tracking for mobile home sales",
            "tasks": [
                {"id": 1, "title": "Process new leads from voice notes", "status": "in-progress", "priority": "high"},
                {"id": 2, "title": "Set follow-up reminders", "status": "todo", "priority": "medium"},
                {"id": 3, "title": "Update lead status for Martinez family", "status": "done", "priority": "low"}
            ],
            "agents": ["ion-assistant"]
        })
    
    return projects

def extract_tasks_from_project(project_path):
    """Extract tasks from action-plan.md or README.md"""
    tasks = []
    task_id = 1
    
    # Try action-plan.md first
    for filename in ["action-plan.md", "README.md", "strategy.md"]:
        filepath = f"{project_path}/{filename}"
        if os.path.exists(filepath):
            with open(filepath, 'r') as f:
                content = f.read()
                for line in content.split('\n'):
                    line = line.strip()
                    if line.startswith('- [ ]'):
                        tasks.append({
                            "id": task_id,
                            "title": line.replace('- [ ]', '').strip(),
                            "status": "todo",
                            "priority": "medium"
                        })
                        task_id += 1
                    elif line.startswith('- [x]'):
                        tasks.append({
                            "id": task_id,
                            "title": line.replace('- [x]', '').strip(),
                            "status": "done",
                            "priority": "medium"
                        })
                        task_id += 1
    
    # Add default tasks if none found
    if not tasks:
        tasks = [
            {"id": 1, "title": "Review project status", "status": "todo", "priority": "low"},
            {"id": 2, "title": "Check for updates", "status": "todo", "priority": "low"}
        ]
    
    return tasks

def get_documents():
    """Scan project directories for markdown files"""
    docs = []
    
    for project_dir in ["lead-lasso", "sheet-show", "ion-crm"]:
        path = f"{PROJECTS_PATH}/{project_dir}"
        if os.path.exists(path):
            for root, dirs, files in os.walk(path):
                if 'node_modules' in root:
                    continue
                for file in files:
                    if file.endswith('.md'):
                        full_path = os.path.join(root, file)
                        rel_path = os.path.relpath(full_path, path)
                        try:
                            mod_time = datetime.fromtimestamp(os.path.getmtime(full_path))
                        except:
                            mod_time = datetime.now()
                        
                        category = "technical"
                        filename_lower = file.lower()
                        if "strategy" in filename_lower or "plan" in filename_lower:
                            category = "strategy"
                        elif "readme" in filename_lower or "guide" in filename_lower:
                            category = "onboarding"
                        elif "spec" in filename_lower or "tech" in filename_lower:
                            category = "technical"
                        
                        docs.append({
                            "title": file.replace('.md', '').replace('-', ' ').title(),
                            "category": category,
                            "project": project_dir,
                            "date": mod_time.strftime("%Y-%m-%d"),
                            "path": rel_path
                        })
    
    return docs

def generate_data():
    """Generate complete dashboard data"""
    data = {
        "workspaces": [
            {
                "id": "main",
                "name": "Rafael",
                "color": "#6366f1",
                "icon": "👤",
                "projects": ["lead-lasso", "sheet-show"]
            },
            {
                "id": "ion",
                "name": "Ion CRM",
                "color": "#10b981",
                "icon": "📱",
                "projects": ["ion-crm"]
            }
        ],
        "projects": get_projects(),
        "agents": {
            "research-lead": {"name": "Research Lead", "project": "lead-lasso", "status": "idle", "task": None},
            "outreach-bot": {"name": "Outreach Bot", "project": "lead-lasso", "status": "working", "task": "Building sequences"},
            "data-analyzer": {"name": "Data Analyzer", "project": "sheet-show", "status": "idle", "task": None},
            "ion-assistant": {"name": "Ion Assistant", "project": "ion-crm", "status": "waiting", "task": "Awaiting voice note"}
        },
        "calendar": [
            {"date": datetime.now().strftime("%Y-%m-%d"), "title": "Review Lead Lasso progress", "type": "reminder"},
            {"date": (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d"), "title": "Call Ion re: new leads", "type": "meeting"},
            {"date": (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d"), "title": "Sheet Show client delivery", "type": "deadline"}
        ],
        "documents": get_documents()
    }
    
    return data

if __name__ == "__main__":
    print("🔄 Generating dashboard data...")
    data = generate_data()
    
    output_file = "data.json"
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"✅ Generated {output_file}")
    print(f"   - {len(data['workspaces'])} workspaces")
    print(f"   - {len(data['projects'])} projects")
    print(f"   - {sum(len(p['tasks']) for p in data['projects'])} tasks")
    print(f"   - {len(data['documents'])} documents")
