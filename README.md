# FSD_MINI_PROJECT — To-Do List Application

A simple full-stack To-Do List built with React, Node.js, and Express. Tasks are persisted locally in `backend/data/tasks.json` so a database setup is not required for this assignment demo.

## Requirements
- Node.js installed
- npm installed

## Run the backend
Open a terminal at the project root:

```powershell
cd backend
npm install
npm run dev
```

Backend URL: http://localhost:5000
Tasks API: http://localhost:5000/api/tasks

## Run the frontend
Open a second terminal at the project root:

```powershell
cd frontend
npm install
npm run dev
```

Open the Local URL printed by Vite (usually http://localhost:5173).

## Features
- Add, view, edit, delete tasks
- Mark tasks completed / pending
- Set date, time, and priority
- Search tasks and filter All / Pending / Completed
- Dashboard counts
- Funny starter tasks
