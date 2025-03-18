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

func ProcessConversation(userMessage string) (string, error) {
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

	model := client.GenerativeModel("gemini-1.5-pro-latest")
	model.Tools = []*genai.Tool{taskTool}
	model.SystemInstruction = &genai.Content{
		Parts: []genai.Part{
			genai.Text(`You are a task management assistant. Before calling the create_task function, ensure all required fields (title, description, priority) are provided.
				If a field is explicitly stated in the user query, extract it directly. If a field can be reasonably inferred with at least 90% certainty, extract it. Only ask the user for missing fields when they cannot be reasonably deduced.The replies of the user will be relevant to the previous question asked by the model. Avoid looping back to previously asked questions. You have the freedom to generate the description and priority based on users first input if the users seems in hurry
				If the user does not specify a priority, default to "medium". Once all necessary fields are obtained, call the function without additional questioning.
			`),
		},
	}

	session := model.StartChat()
	res, err := session.SendMessage(ctx, genai.Text(userMessage))
	if err != nil {
		return "", fmt.Errorf("session.SendMessage: %v", err)
	}

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

				// Capture the final AI response after function execution
				for _, fnCand := range fnResponse.Candidates {
					for _, fnPart := range fnCand.Content.Parts {
						if textPart, isText := fnPart.(genai.Text); isText {
							fmt.Println("Final Response:", textPart)
							aiResponse += string(textPart) + "\n" // Append response
						}
					}
				}
			} else if textPart, isText := part.(genai.Text); isText {
				// Append text response before function call
				fmt.Println("Text response before function call:", textPart)
				aiResponse += string(textPart) + "\n" // Append text response
			}
		}
	}

	// Trim any trailing newline
	aiResponse = string(aiResponse)
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