# 🚀 Mission Control Dashboard

A visual command center for managing your projects, agents, and workspaces. Styled with a deep space theme.

## Quick Deploy (Free)

### Option 1: Vercel (Recommended)
1. Go to [vercel.com](https://vercel.com) → "New Project"
2. Drag & drop this folder onto the page
3. Get your URL (e.g., `your-project.vercel.app`)

### Option 2: Netlify
1. Go to [app.netlify.com](https://app.netlify.com)
2. Drag & drop this folder
3. Get your URL

### Option 3: Local Testing
```bash
python3 -m http.server 8080
# Open http://localhost:8080
```

## Files Included

```
├── index.html      # Main dashboard (single page app)
├── css/main.css    # Deep space theme styles
├── js/app.js       # Core application logic
├── js/tasks.js     # Task editing functionality
├── data.json       # Dashboard data (projects, tasks, agents)
├── vercel.json     # Vercel deployment config
└── README.md       # This file
```

## Data Structure

Edit `data.json` to update:
- **workspaces**: Rafael, Ion CRM, etc.
- **projects**: Lead Lasso, Sheet Show, Ion CRM
- **tasks**: Kanban board items
- **agents**: Agent status cards
- **calendar**: Events and deadlines
- **documents**: File index

## Update Data

Run `python3 generate-data.py` to regenerate data.json from project files (if you have local access to your projects folder).

## Features

- 🌌 Deep Space theme with animated stars
- ⚡ Workspace switching (Rafael ↔ Ion)
- 📋 Task manager with click-to-edit
- 🤖 Agent status viewer
- 🏢 Pixel office visualization
- 📅 Calendar view
- 📁 Document hub
- 💬 Chat interface
- 🔍 Searchable documents

## Troubleshooting

**404 on deploy?**
- Ensure `vercel.json` is included in the upload
- Try clearing Vercel cache (Deployments → "Purge Cache")

**Styles not loading?**
- Check that `css/main.css` is present
- External fonts may take a moment to load

**Data not showing?**
- Verify `data.json` is valid JSON
- Open browser console (F12) for errors

---
Built for Claw ⚡