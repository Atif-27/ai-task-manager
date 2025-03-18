package genai

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

func Test() {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(os.Getenv("API_KEY")))
	if err != nil {
		log.Fatal(err)
	}
	defer client.Close()

	// Define the schema for task creation
	schema := &genai.Schema{
		Type: genai.TypeObject,
		Properties: map[string]*genai.Schema{
			"title": {
				Type:        genai.TypeString,
				Description: "The title of the task",
			},
			"description": {
				Type:        genai.TypeString,
				Description: "A detailed description of the task",
			},
			"priority": {
				Type:        genai.TypeString,
				Description: "Priority level: low, medium, or high",
			},
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

	model := client.GenerativeModel("gemini-1.5-pro-latest")
	model.Tools = []*genai.Tool{taskTool}
	
	// Set system prompt to guide model behavior
	model.SystemInstruction = &genai.Content{
		Parts: []genai.Part{
			genai.Text("You are a task management assistant. Before calling the create_task function, ensure all required fields (title, description, priority) are provided. If a field is clearly stated in the user query, extract it directly. If a field can be deduced with at least 50% certainty, extract it. Only ask the user for missing fields when they cannot be reasonably inferred from the query"),
		},
	}

	// Start a chat session
	session := model.StartChat()

	// Process a user message
	ProcessUserMessage(ctx, session, "Create a task to dockerize next.js app high priority, and generate a description accordinly", taskTool.FunctionDeclarations[0].Name)
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

func ProcessUserMessage(ctx context.Context, session *genai.ChatSession, userMessage string, functionName string) {
	fmt.Printf("Received message: %s\n\n", userMessage)
	
	// Send the user message to the model
	res, err := session.SendMessage(ctx, genai.Text(userMessage))
	if err != nil {
		log.Fatalf("session.SendMessage: %v", err)
	}
	
	// Process the response
	HandleModelResponse(ctx, session, res, functionName)
}

func HandleModelResponse(ctx context.Context, session *genai.ChatSession, res *genai.GenerateContentResponse, functionName string) {
	for _, cand := range res.Candidates {
		for _, part := range cand.Content.Parts {
			funcall, ok := part.(genai.FunctionCall)
			if !ok {
				// This is a regular text response
				fmt.Println("AI Response:", part)
				continue
			}

			// Handle function calls
			switch funcall.Name {
			case "create_task":
				fmt.Println("Function call detected: create_task")
				
				// Extract arguments
				title, _ := funcall.Args["title"].(string)
				description, _ := funcall.Args["description"].(string)
				priority, _ := funcall.Args["priority"].(string)
				
				// Create the task
				task, err := CreateTask(title, description, priority)
				if err != nil {
					log.Fatalf("Failed to create task: %v", err)
				}
				
				// Send function response back to the model
				fnResponse, err := session.SendMessage(ctx, genai.FunctionResponse{
					Name: functionName,
					Response: map[string]any{
						"success": true,
						"taskId":  task.ID,
						"message": "Task created successfully",
					},
				})
				if err != nil {
					log.Fatal(err)
				}
				
				// Process the final model response
				for _, fnCand := range fnResponse.Candidates {
					for _, fnPart := range fnCand.Content.Parts {
						fmt.Println("AI Final Response:", fnPart)
					}
				}
				
			default:
				fmt.Printf("Unknown function call: %s\n", funcall.Name)
			}
		}
	}
}