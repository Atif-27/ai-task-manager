package genai

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

type AITaskSuggestion struct {
	Title       string   `json:"title"`
	Description []string `json:"description"`
	Priority    string   `json:"priority"`
}

func GetAISuggestion(taskTitle string) (AITaskSuggestion, error) {
	fmt.Println("Generating AI task suggestion...")
	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(os.Getenv("API_KEY")))
	if err != nil {
		return AITaskSuggestion{}, fmt.Errorf("failed to create Gemini client: %v", err)
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-1.5-flash")

	prompt := fmt.Sprintf(`
	Analyze the given task title: "%s".
	
	Dont interact with the user with something other than  JSON response, Your only job is to:
	1. Generate a clear and meaningful description **in stepwise bullet points** (at least 4-5 steps) and make it concise and short.
	2. Determine the priority level (low, medium, high).
	
	Respond in strict JSON format:
	{
  		"title": "Develop User Authentication",
  		"description": [
    	"Step 1: Define authentication requirements.",
    	"Step 2: Implement JWT-based authentication.",
    	"Step 3: Set up user roles and permissions.",
    	"Step 4: Integrate social login (Google, GitHub).",
    	"Step 5: Implement multi-factor authentication (MFA)."
  		],
  		"priority": "high"
	}
	`, taskTitle)

	// Generate AI response
	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return AITaskSuggestion{}, fmt.Errorf("failed to generate AI content: %v", err)
	}

	// Check if the response contains candidates
	if len(resp.Candidates) == 0 || resp.Candidates[0].Content == nil {
		return AITaskSuggestion{}, fmt.Errorf("no response from Gemini API")
	}

	// Extract the AI response text
	aiResponse := resp.Candidates[0].Content.Parts[0].(genai.Text)
	aiResponseStr := strings.TrimSpace(string(aiResponse))

	// Clean up the response (remove ```json and ``` if present)
	aiResponseStr = strings.TrimPrefix(aiResponseStr, "```json\n")
	aiResponseStr = strings.TrimSuffix(aiResponseStr, "\n```")

	// Parse the cleaned JSON response
	var aiSuggestion AITaskSuggestion
	if err := json.Unmarshal([]byte(aiResponseStr), &aiSuggestion); err != nil {
		return AITaskSuggestion{}, fmt.Errorf("failed to parse AI response: %v", err)
	}

	// Ensure the parsed JSON has valid fields
	if aiSuggestion.Title == "" || len(aiSuggestion.Description) == 0 || aiSuggestion.Priority == "" {
		return AITaskSuggestion{}, fmt.Errorf("invalid AI response: missing required fields")
	}
	fmt.Println(aiSuggestion)
	return aiSuggestion, nil
}
