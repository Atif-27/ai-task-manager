package ws

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/Atif-27/ai-task-manager/genai"
	"github.com/gofiber/websocket/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"
)
const (
	MessageTypeChat      = "chat"
	MessageTypeAIRequest = "ai_request"
	MessageTypeAIResponse = "ai_response"
	MessageTypeTaskCreated = "task_created"
	MessageTypeError     = "error"
)

type AIConversationRequest struct {
    Message string `json:"message"`
}

type AIConversationResponse struct {
	Message string `json:"message"`
}

type ErrorResponse struct {
	Message string `json:"message"`
}

func AutomationWebSocketHandler(c *websocket.Conn, messageObj WebSocketMessage, userID primitive.ObjectID) {
	switch messageObj.Type {
	case MessageTypeAIRequest:
		handleAIRequest(c, messageObj.Payload, userID)
	case MessageTypeChat:
		// Handle regular chat messages if needed
		log.Printf("Chat message from user %s: %v", userID.Hex(), messageObj.Payload)
	default:
		sendErrorMessage(c, "Unknown message type")
	}
}





// handleAIRequest processes AI conversation requests
func handleAIRequest(c *websocket.Conn, payload interface{}, userID primitive.ObjectID) {
	// Convert payload to AIConversationRequest
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		sendErrorMessage(c, "Invalid request format")
		return
	}
	
	var request AIConversationRequest
	if err := json.Unmarshal(payloadBytes, &request); err != nil {
		sendErrorMessage(c, "Invalid request format")
		return
	}
	

	
	// Process the AI conversation with a timeout context
	result,err := genai.ProcessConversation(request.Message)
	if err != nil {
		sendErrorMessage(c, fmt.Sprintf("AI processing error: %v", err))
		return
	}
	fmt.Println("-------------------------------------", result)
	// Send AI response
	sendMessage(c, WebSocketMessage{
		Type: MessageTypeAIResponse,
		Payload: AIConversationResponse{
			Message: result,
		},
	})
}