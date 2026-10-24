# NeuroDesk

AI-assisted service desk prototype, built in 36 hours at an internal company hackathon by a team of 12 trainees: automated ticket assignment that routes incoming requests to technicians based on skill and current workload, instead of manual triage.

## What it does
- Skill- and workload-aware assignment of incoming tickets
- Per-technician workload visibility
- AI-assisted request handling

## How it's put together
- `frontend/` — JavaScript, HTML, CSS
- `backend/` — Node.js (Express, Sequelize/MySQL, Socket.IO) ticket management API
- `ai-backend/` — Python (Flask) assignment service

*Hackathon prototype — built under a 36-hour deadline; rough edges intentional.*
