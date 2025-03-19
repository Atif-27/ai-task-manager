package genai

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/Atif-27/ai-task-manager/database"
	"github.com/Atif-27/ai-task-manager/models"
	"github.com/google/generative-ai-go/genai"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"google.golang.org/api/option"
)

// UserSession holds a user's chat session and related metadata
type UserSession struct {
	Session  *genai.ChatSession
	Model    *genai.GenerativeModel // Store the model instance with the session
	LastUsed time.Time
	UserID   string
	Mutex    sync.Mutex
}

// SessionManager manages multiple user sessions
type SessionManager struct {
	sessions    map[string]*UserSession
	client      *genai.Client
	mutex       sync.RWMutex
	cleanupDone chan struct{}
}

var (
	manager     *SessionManager
	managerOnce sync.Once
)

// GetSessionManager returns a singleton instance of SessionManager
func GetSessionManager(ctx context.Context) (*SessionManager, error) {
	var initErr error

	managerOnce.Do(func() {
		client, err := genai.NewClient(ctx, option.WithAPIKey(os.Getenv("API_KEY")))
		if err != nil {
			initErr = err
			return
		}

		manager = &SessionManager{
			sessions:    make(map[string]*UserSession),
			client:      client,
			mutex:       sync.RWMutex{},
			cleanupDone: make(chan struct{}),
		}

		// Start a goroutine for session cleanup
		go manager.sessionCleanup()
	})

	return manager, initErr
}

// createNewModel creates a new generative model with the proper configuration
func (sm *SessionManager) createNewModel() *genai.GenerativeModel {
	// Define the schema for task creation
	schema := &genai.Schema{
		Type: genai.TypeObject,
		Properties: map[string]*genai.Schema{
			"title":       {Type: genai.TypeString, Description: "The title of the task"},
			"description": {Type: genai.TypeString, Description: "A detailed description of the task"},
			"priority":    {Type: genai.TypeString, Description: "Priority level: low, medium, or high"},
		},
		Required: []string{"title", "description", "priority"},
	}
	getUserTasksSchema := &genai.Schema{
        Type: genai.TypeObject,
        Properties: map[string]*genai.Schema{
			"priority":{Type: genai.TypeString, Description: "Just a dummy text"},
		},
    }

	taskTool := &genai.Tool{
		FunctionDeclarations: []*genai.FunctionDeclaration{{
			Name:        "create_task",
			Description: "Create a new task with the given details. All fields (title, description, priority) are required.",
			Parameters:  schema,
		},{
                Name:        "get_user_tasks",
                Description: "Get all tasks assigned to the current user.",
                Parameters:  getUserTasksSchema,
            },},
	}

	model := sm.client.GenerativeModel("gemini-1.5-pro-latest")
	model.Tools = []*genai.Tool{taskTool}
	model.SystemInstruction = &genai.Content{
		Parts: []genai.Part{
			genai.Text(`You are a task management assistant. You can help users create tasks and prioritize their existing tasks.

For task creation:
Before calling the create_task function, ensure all required fields (title, description, priority) are provided.
If a field is explicitly stated in the user query, extract it directly. If a field can be reasonably inferred with at least 90% certainty, extract it. 
Only ask the user for missing fields when they cannot be reasonably deduced. Remember that each new message from the user is a response to your previous question.
The replies of the user will be relevant to the previous question asked. Avoid looping back to previously asked questions.
You have the freedom to generate the description and priority based on users first input if the user seems in hurry.
If the user does not specify a priority, default to "medium". Once all necessary fields are obtained, call the function without additional questioning.

For task prioritization:
When a user asks what tasks they should prioritize today or similar questions about task prioritization, call the get_user_tasks function.
After receiving the list of tasks, analyze them considering:
- Priority level (high takes precedence over medium and low)
- Due dates if available (closer due dates are more urgent)
- Task status (focus on pending tasks)
Then recommend which task(s) the user should focus on first, explaining your reasoning in a clear, concise manner.
`),
		},
	}

	return model
}

// GetOrCreateSession retrieves an existing session or creates a new one
func (sm *SessionManager) GetOrCreateSession(userID string) *UserSession {
	sm.mutex.Lock()
	defer sm.mutex.Unlock()

	session, exists := sm.sessions[userID]
	if !exists || time.Since(session.LastUsed) > 30*time.Minute {
		// Create a new model instance for each session to ensure isolation
		model := sm.createNewModel()
		newSession := &UserSession{
			Session:  model.StartChat(),
			Model:    model, // Store the model instance with the session
			LastUsed: time.Now(),
			UserID:   userID,
		}
		sm.sessions[userID] = newSession
		return newSession
	}

	// Update last used time
	session.LastUsed = time.Now()
	return session
}

// UpdateSessionTimestamp updates the last used timestamp for a session
func (sm *SessionManager) UpdateSessionTimestamp(userID string) {
	sm.mutex.Lock()
	defer sm.mutex.Unlock()

	if session, exists := sm.sessions[userID]; exists {
		session.LastUsed = time.Now()
	}
}

// ClearSession removes a user's session
func (sm *SessionManager) ClearSession(userID string) {
	sm.mutex.Lock()
	defer sm.mutex.Unlock()
	delete(sm.sessions, userID)
}

// Close closes the GenAI client and stops the cleanup goroutine
func (sm *SessionManager) Close() {
	close(sm.cleanupDone)
	sm.client.Close()
}

// sessionCleanup periodically removes inactive sessions
func (sm *SessionManager) sessionCleanup() {
	ticker := time.NewTicker(10 * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			sm.mutex.Lock()
			now := time.Now()
			for userID, session := range sm.sessions {
				if now.Sub(session.LastUsed) > 30*time.Minute {
					delete(sm.sessions, userID)
					log.Printf("Cleaned up inactive session for user %s", userID)
				}
			}
			sm.mutex.Unlock()
		case <-sm.cleanupDone:
			return
		}
	}
}

// ProcessConversation processes a message in the context of a conversation
// Define a simpler task representation for API responses
type SimpleTask struct {
    ID          string `json:"id"`
    Title       string `json:"title"`
    Description string `json:"description"`
    Priority    string `json:"priority"`
    Status      string `json:"status"`
    CreatedAt   string `json:"createdAt"`
}

// ProcessConversation processes a message in the context of a conversation
func ProcessConversation(ctx context.Context, userMessage string, userID string) (string, error) {
    // Get or create session manager
    sm, err := GetSessionManager(ctx)
    if err != nil {
        return "", fmt.Errorf("failed to initialize session manager: %v", err)
    }

    // Get or create a chat session for this user
    userSession := sm.GetOrCreateSession(userID)

    userSession.Mutex.Lock()
    defer userSession.Mutex.Unlock()

    // Send the message in the context of the ongoing conversation
    res, err := userSession.Session.SendMessage(ctx, genai.Text(userMessage))
    if err != nil {
        return "", fmt.Errorf("session.SendMessage: %v", err)
    }

    // Update the session timestamp
    sm.UpdateSessionTimestamp(userID)

    var aiResponse strings.Builder

    // Process all response parts
    for _, cand := range res.Candidates {
        for _, part := range cand.Content.Parts {
            if textPart, isText := part.(genai.Text); isText {
                // Append text response
                aiResponse.WriteString(string(textPart))
            } else if funcall, ok := part.(genai.FunctionCall); ok {
                var fnResponse *genai.GenerateContentResponse
                var fnErr error

                switch funcall.Name {
                case "create_task":
                    // Extract task details with proper type checking
                    title, ok1 := funcall.Args["title"].(string)
                    description, ok2 := funcall.Args["description"].(string)
                    priority, ok3 := funcall.Args["priority"].(string)

                    if !ok1 || !ok2 || !ok3 {
                        return aiResponse.String(), fmt.Errorf("invalid task parameters received from model")
                    }

                    // Create the task
                    task, err := CreateTask(title, description, priority, userID)
                    if err != nil {
                        // Send error response back to model
                        fnResponse, fnErr = userSession.Session.SendMessage(ctx, genai.FunctionResponse{
                            Name: funcall.Name,
                            Response: map[string]interface{}{
                                "success": false,
                                "error":   err.Error(),
                            },
                        })
                    } else {
                        // Send success response back to model
                        fnResponse, fnErr = userSession.Session.SendMessage(ctx, genai.FunctionResponse{
                            Name: funcall.Name,
                            Response: map[string]interface{}{
                                "success": true,
                                "taskId":  task.ID.Hex(),
                                "message": "Task created successfully",
                            },
                        })
                    }

                case "get_user_tasks":
                    // Get tasks for the user
                    tasks, err := GetUserTasks(userID)
                    if err != nil {
                        // Send error response back to model
                        fnResponse, fnErr = userSession.Session.SendMessage(ctx, genai.FunctionResponse{
                            Name: funcall.Name,
                            Response: map[string]interface{}{
                                "success": false,
                                "error":   err.Error(),
                            },
                        })
                    } else {
                        // Create a text representation of tasks instead of trying to send complex objects
                        taskSummary := "Tasks:\n"
                        for _, task := range tasks {
                            taskSummary += fmt.Sprintf("- ID: %s\n  Title: %s\n  Description: %s\n  Priority: %s\n  Status: %s\n  Created: %s\n\n",
                                task.ID.Hex(),
                                task.Title,
                                task.Description,
                                string(task.Priority),
                                string(task.Status),
                                task.CreatedAt.Format(time.RFC3339))
                        }
                        
                        // Send success response back to model
                        fnResponse, fnErr = userSession.Session.SendMessage(ctx, genai.FunctionResponse{
                            Name: funcall.Name,
                            Response: map[string]interface{}{
                                "success": true,
                                "summary": taskSummary,
                            },
                        })
                    }

                default:
                    return aiResponse.String(), fmt.Errorf("unknown function call: %s", funcall.Name)
                }

                if fnErr != nil {
                    log.Printf("Error sending function response for %s: %v", funcall.Name, fnErr)
                    continue
                }

                // Process the model's response to the function call
                if fnResponse != nil {
                    for _, fnCand := range fnResponse.Candidates {
                        for _, fnPart := range fnCand.Content.Parts {
                            if textPart, isText := fnPart.(genai.Text); isText {
                                aiResponse.WriteString(string(textPart))
                            }
                        }
                    }
                }
            }
        }
    }

    return aiResponse.String(), nil
}

// Task represents a task in our system
type Task struct {
	ID          string
	Title       string
	Description string
	Priority    string
	CreatedAt   time.Time
}

// CreateTask creates a new task from conversation extracted details
func CreateTask(title string, description string, priority string, userID string) (*models.Task, error) {
	ctx := context.Background()
	taskCollection := database.GetCollection("task")
	userObjID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %v", err)
	}
	var taskPriority models.PriorityType
	switch strings.ToLower(priority) {
	case "high":
		taskPriority = models.HIGH
	case "medium":
		taskPriority = models.MEDIUM
	default:
		taskPriority = models.LOW
	}

	// Create new task
	task := models.Task{
		Title:       title,
		Description: description,
		Priority:    taskPriority,
		Status:      models.PENDING,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
		AssignedBy:  userObjID,
		AssignedTo:  []primitive.ObjectID{},
		ID:          primitive.NewObjectID(),
	}
	_, err = taskCollection.InsertOne(ctx, task)
	if err != nil {
		return nil, fmt.Errorf("failed to create task: %v", err)
	}
	return &task, nil
}

// GetUserTasks retrieves all tasks assigned to a user
func GetUserTasks(userID string) ([]models.Task, error) {
    ctx := context.Background()
    taskCollection := database.GetCollection("task")
    
    userObjID, err := primitive.ObjectIDFromHex(userID)
    if err != nil {
        return nil, fmt.Errorf("invalid user ID: %v", err)
    }
    
    filter := bson.M{"assigned_to": userObjID}
    cursor, err := taskCollection.Find(ctx, filter)
    if err != nil {
        return nil, fmt.Errorf("could not fetch assigned tasks: %v", err)
    }
    
    var tasks []models.Task
    if err := cursor.All(ctx, &tasks); err != nil {
        return nil, fmt.Errorf("failed to parse assigned tasks: %v", err)
    }
    
    return tasks, nil
}
