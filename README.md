# Backline — milestone 1

A working Next.js frontend connected to a FastAPI backend. The backend currently acknowledges requests; it does not perform live searches, send emails, persist data, or run an AI agent.

## Requirements
Node.js 20+ and Python 3.10+.

## Terminal 1 — API
```bash
cd backline-starter/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Verify at http://localhost:8000/health and see docs at http://localhost:8000/docs.

## Terminal 2 — web
```bash
cd backline-starter/web
npm install
npm run dev
```
Open http://localhost:3000 and submit the booking form. Leave both terminals running.

## Next milestones
- Database and user authentication with per-artist access control
- Source-backed venue/band research tools
- Durable agent tasks, audit log, and approval gates
- Gmail/Calendar integration and verified booking workflow
