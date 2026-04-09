# Mission Control Dashboard

A visual dashboard for managing your projects, agents, and workspace.

## Quick Start (View Dashboard)

1. Deploy to Vercel or Netlify (free):
   - Go to [vercel.com](https://vercel.com) → New Project
   - Drag this folder or connect GitHub
   - Get your URL

2. Or run locally:
   ```bash
   python3 -m http.server 8080
   # Open http://localhost:8080
   ```

## Keep Data Updated

To update the dashboard with latest project data, run:

```bash
python3 generate-data.py
```

This scans your project folders and auto-generates `data.json`.

### Configuration

Edit `generate-data.py` and set your workspace path:
```python
WORKSPACE_PATH = "/path/to/your/projects"
```

Default: `./projects` (current folder)

## Features

- **Workspaces** - Switch between Rafael / Ion / others
- **Task Manager** - Kanban view of all project tasks
- **Agent Manager** - See agent status across projects
- **Office** - Pixel art visualization of what's running
- **Calendar** - Upcoming events and deadlines
- **Document Hub** - Searchable project documents
- **Fellowship** - Team overview with mission statement

## Project Structure

```
dashboard/
├── index.html      # Main UI
├── css/main.css    # Styles
├── js/app.js       # Frontend logic
├── data.json       # Dashboard data (regenerated)
├── generate-data.py # Script to update data.json
└── README.md
```

## Adding New Workspaces

Edit `data.json` or the generate script to add more workspaces:

```json
{
  "id": "new-workspace",
  "name": "New Workspace",
  "color": "#ff6b6b",
  "icon": "🚀",
  "projects": ["project-id-1", "project-id-2"]
}
```

Then add corresponding projects with `"workspace": "new-workspace"`.