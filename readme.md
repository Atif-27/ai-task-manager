# AI Task Manager

AI Task Manager is a task management system with AI-powered task creation and WebSocket support.

## Features
### 📌 **User Management**
- **Register a new user** → 
- **User login** → 
- **Get all users** 

### 📌 **Task Management**
- **Create a task** 
- **Delete a task**  
- **Update a task** 
- **Get all tasks** 
- **Get tasks assigned to the user**
- **Fetch a specific task by ID** 

### ⚡ **WebSocket for Real-time Updates**
- **Connect to WebSocket** → `GET /api/v1/ws`  
- **Receive real-time** updates whenever tasks are created, updated, or deleted.  
- **AI-Powered Chat** → Interact with an AI agent to automate task creation and receive intelligent task prioritization suggestions.

## Setup Instructions

### 1. Normal Setup (Without Docker)

```sh
git clone https://github.com/Atif-27/ai-task-manager.git  
cd ai-task-manager  
cd backend  
go mod tidy  
go run main.go  
```
**Rename environment files:**  
- `mv frontend/env.example frontend/.env`  
- `mv backend/env.example backend/.env`  
- Add your API_KEY for gemini AI

### 2. Using Docker (Docker Compose)
```sh
git clone https://github.com/Atif-27/ai-task-manager.git  
cd ai-task-manager  
docker-compose up --build  
```

**Rename environment file for Docker:**  
- `mv frontend/env.example frontend/.env`  
- `mv .env.docker.example .env.docker`  



## API Endpoints

| Method | Endpoint               | Description                       | Authentication |
|--------|------------------------|-----------------------------------|---------------|
| POST   | /api/v1/register       | Register a new user              | ❌            |
| POST   | /api/v1/login          | User login                       | ❌            |
| GET    | /api/v1/users          | Get all users                    | ✅            |
| POST   | /api/v1/tasks          | Create a task                    | ✅            |
| GET    | /api/v1/tasks          | Get all tasks                    | ✅            |
| GET    | /api/v1/tasks/me       | Get tasks assigned to user       | ✅            |
| GET    | /api/v1/tasks/:id      | Get a specific task              | ✅            |
| PUT    | /api/v1/tasks/:id      | Update a task                    | ✅            |
| DELETE | /api/v1/tasks/:id      | Delete a task                    | ✅            |
| GET    | /api/v1/ws             | WebSocket for real-time updates  | ✅            |

## WebSocket Usage

1. Connect to WebSocket:  
   ws://localhost:8080/api/v1/ws  

2. Listen for real-time updates on tasks.

## Environment Variables

- PORT - Server port (default: 8080)  
- DATABASE_URL - PostgreSQL connection string  
- JWT_SECRET - Secret key for JWT authentication  

## Technologies Used

- **Backend**: Golang (Fiber Framework)  
- **Database**: PostgreSQL  
- **Authentication**: JWT  
- **Real-time**: WebSockets  
- **Containerization**: Docker  

## License

This project is licensed under the MIT License.
