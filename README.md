# DeskFlow — Support Ticket Triage Board

A full-stack MERN application for managing support tickets. Customers submit tickets with a priority, and support agents view them on a Kanban-style board grouped by status. Tickets that exceed their response time target are flagged as breaching SLA.

## Tech Stack

- **Frontend**: React (Vite)
- **Backend**: Node.js, Express
- **Database**: MongoDB Atlas

## Features

- Kanban board with 4 columns: Open, In Progress, Resolved, Closed
- Ticket creation with validation
- Status transitions with server-side rule enforcement
- SLA breach tracking based on priority
- Filters by priority and SLA breach status
- Stats strip with aggregate counts

## Setup

### Backend

```bash
cd backend
npm install
# Create .env with MONGODB_URI
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

| Method | Endpoint        | Description                          |
|--------|-----------------|--------------------------------------|
| POST   | /tickets        | Create a ticket                      |
| GET    | /tickets        | List tickets (supports filters)      |
| PATCH  | /tickets/:id    | Update ticket status                 |
| DELETE | /tickets/:id    | Delete a ticket                      |
| GET    | /tickets/stats  | Aggregate stats                      |
