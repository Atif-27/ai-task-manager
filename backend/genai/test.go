package genai

import (
	"context"
	"fmt"
	"log"
	"os"
	"sync"
	"time"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

// UserSession holds a user's chat session and related metadata
type UserSession struct {
	Session   *genai.ChatSession
	LastUsed  time.Time
	UserID    string
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

	taskTool := &genai.Tool{
		FunctionDeclarations: []*genai.FunctionDeclaration{{
			Name:        "create_task",
			Description: "Create a new task with the given details. All fields (title, description, priority) are required.",
			Parameters:  schema,
		}},
	}

	model := sm.client.GenerativeModel("gemini-1.5-pro-latest")
	model.Tools = []*genai.Tool{taskTool}
	model.SystemInstruction = &genai.Content{
		Parts: []genai.Part{
			genai.Text(`You are a task management assistant. Before calling the create_task function, ensure all required fields (title, description, priority) are provided.
				If a field is explicitly stated in the user query, extract it directly. If a field can be reasonably inferred with at least 90% certainty, extract it. 
				Only ask the user for missing fields when they cannot be reasonably deduced. Remember that each new message from the user is a response to your previous question.
				The replies of the user will be relevant to the previous question asked. Avoid looping back to previously asked questions.
				You have the freedom to generate the description and priority based on users first input if the user seems in hurry.
				If the user does not specify a priority, default to "medium". Once all necessary fields are obtained, call the function without additional questioning.
			`),
		},
	}

	return model
}

// GetOrCreateSession retrieves an existing session or creates a new one
func (sm *SessionManager) GetOrCreateSession(userID string) *genai.ChatSession {
	sm.mutex.Lock()
	defer sm.mutex.Unlock()

	session, exists := sm.sessions[userID]
	if !exists || time.Since(session.LastUsed) > 30*time.Minute {
		// Create a new model instance for each session to ensure isolation
		model := sm.createNewModel()
		newSession := &UserSession{
			Session:  model.StartChat(),
			LastUsed: time.Now(),
			UserID:   userID,
		}
		sm.sessions[userID] = newSession
		return newSession.Session
	}

	// Update last used time
	session.LastUsed = time.Now()
	return session.Session
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
func ProcessConversation(ctx context.Context, userMessage string, userID string) (string, error) {
	// Get or create session manager
	sm, err := GetSessionManager(ctx)
	if err != nil {
		return "", fmt.Errorf("failed to initialize session manager: %v", err)
	}

	// Get or create a chat session for this user
	session := sm.GetOrCreateSession(userID)

	// Send the message in the context of the ongoing conversation
	res, err := session.SendMessage(ctx, genai.Text(userMessage))
	if err != nil {
		return "", fmt.Errorf("session.SendMessage: %v", err)
	}

	// Update the session timestamp
	sm.UpdateSessionTimestamp(userID)

	var aiResponse string

	// Process all response parts
	for _, cand := range res.Candidates {
		for _, part := range cand.Content.Parts {
			if funcall, ok := part.(genai.FunctionCall); ok {
				// Extract task details
				title, _ := funcall.Args["title"].(string)
				description, _ := funcall.Args["description"].(string)
				priority, _ := funcall.Args["priority"].(string)

				// Create the task
				task, err := CreateTask(title, description, priority)
				if err != nil {
					return aiResponse, fmt.Errorf("failed to create task: %v", err)
				}

				// Send function response back to model
				fnResponse, err := session.SendMessage(ctx, genai.FunctionResponse{
					Name: funcall.Name,
					Response: map[string]any{
						"success": true,
						"taskId":  task.ID,
						"message": "Task created successfully",
					},
				})
				if err != nil {
					log.Println("Error sending function response:", err)
					return aiResponse, nil
				}

				// After task creation, reset the session to start fresh for next task
				// This is optional - remove if you want to maintain conversation context after task creation
				sm.ClearSession(userID)

				// Capture the final AI response after function execution
				for _, fnCand := range fnResponse.Candidates {
					for _, fnPart := range fnCand.Content.Parts {
						if textPart, isText := fnPart.(genai.Text); isText {
							aiResponse += string(textPart)
						}
					}
				}
			} else if textPart, isText := part.(genai.Text); isText {
				// Append text response before function call
				aiResponse += string(textPart)
			}
		}
	}

	return aiResponse, nil
}

// Task represents a task in our system
type Task struct {
	ID          string
	Title       string
	Description string
	Priority    string
	CreatedAt   time.Time
}

// CreateTask creates a new task with the given details
func CreateTask(title, description, priority string) (*Task, error) {
	// Generate a simple ID based on timestamp
	id := fmt.Sprintf("task_%d", time.Now().Unix())
	
	task := &Task{
		ID:          id,
		Title:       title,
		Description: description,
		Priority:    priority,
		CreatedAt:   time.Now(),
	}
	
	// Log task creation (in a real app, you might store this in memory or a file)
	fmt.Printf("Created task: %+v\n", task)
	
	return task, nil
}



