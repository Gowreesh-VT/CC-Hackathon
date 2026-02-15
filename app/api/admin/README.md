# Admin API Documentation

## Overview
This directory contains the backend API routes for the **Admin Panel** of the Event Web Platform.
These endpoints allow admins to manage rounds, teams, judges, and subtasks.

**Base URL:** `http://localhost:3000/api/admin`

> **Note:** Currently, these APIs are running in **Mock Mode**. They return dummy JSON data for development purposes and are not yet connected to a live database.

---

## 🔗 API Endpoints Reference

### 1. Dashboard
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/dashboard` | Returns aggregate statistics (total teams, active rounds, etc). |

### 2. Rounds Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/rounds` | List all rounds (e.g., Round 1, Round 2). |
| `POST` | `/rounds` | Create a new round. Body: `{ name, description }` |
| `PATCH` | `/rounds/[roundId]` | Start/Stop a round. Body: `{ action: "start" | "stop" }` |

### 3. Subtasks (Cards)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/rounds/[roundId]/subtasks` | Get all subtasks for a specific round. |
| `POST` | `/rounds/[roundId]/subtasks` | Add a subtask to a round. Body: `{ title, description }` |
| `PUT` | `/subtasks/[subtaskId]` | Update a specific subtask. |
| `DELETE` | `/subtasks/[subtaskId]` | Remove a specific subtask. |

### 4. Team Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/teams` | List all registered teams. |
| `POST` | `/teams` | Manually add a team. Body: `{ name, members: [] }` |
| `PATCH` | `/teams/[teamId]/lock` | **Force Lock** a team's card selection. |
| `POST` | `/teams/[teamId]/shortlist` | Promote a team to the next round. |

### 5. Judge Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/judges` | List all judges. |
| `POST` | `/judges` | Add a new judge. Body: `{ name, expertise }` |
| `POST` | `/judges/[judgeId]/assign` | Assign a team to a judge. Body: `{ teamId }` |

---

## 🛠 How to Test
You can test these endpoints using **Postman** or `curl`.

**Example: Start Round 1**
```bash
PATCH http://localhost:3000/api/admin/rounds/1
Content-Type: application/json

{
  "action": "start"
}