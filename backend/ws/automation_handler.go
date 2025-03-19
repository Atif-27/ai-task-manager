package ws

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sync"

	"github.com/Atif-27/ai-task-manager/genai"
	"github.com/gofiber/websocket/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

const (
	MessageTypeChat        = "chat"
	MessageTypeAIRequest   = "ai_request"
	MessageTypeAIResponse  = "ai_response"
	MessageTypeTaskCreated = "task_created"
	MessageTypeError       = "error"
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

// Map to track ongoing AI conversations by user ID
var (
	activeConversations = make(map[string]bool)
	conversationMutex   = &sync.Mutex{}
)

func AutomationWebSocketHandler(c *websocket.Conn, ctx context.Context, messageObj WebSocketMessage, userID primitive.ObjectID) {
	userIDStr := userID.Hex()

	switch messageObj.Type {
	case MessageTypeAIRequest:
		// Check if a conversation is already in progress for this user
		conversationMutex.Lock()
		if activeConversations[userIDStr] {
			conversationMutex.Unlock()
			sendErrorMessage(c, "You already have an active conversation. Please wait for a response.")
			return
		}

		// Mark this user as having an active conversation
		activeConversations[userIDStr] = true
		conversationMutex.Unlock()

		// Process the request in a separate goroutine
		go func() {
			defer func() {
				// When done, mark the conversation as inactive
				conversationMutex.Lock()
				delete(activeConversations, userIDStr)
				conversationMutex.Unlock()
			}()

			handleAIRequest(c, ctx, messageObj.Payload, userID)
		}()

	case MessageTypeChat:
		// Handle regular chat messages if needed
		log.Printf("Chat message from user %s: %v", userIDStr, messageObj.Payload)

	default:
		sendErrorMessage(c, "Unknown message type")
	}
}

// handleAIRequest processes AI conversation requests
func handleAIRequest(c *websocket.Conn, ctx context.Context, payload interface{}, userID primitive.ObjectID) {
	userIDStr := userID.Hex()
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

	// Log the user's request to help with debugging
	log.Printf("Processing AI request from user %s", userIDStr)

	// Process the AI conversation, passing the userID as a string to identify the session
	result, err := genai.ProcessConversation(ctx, request.Message, userIDStr)
	if err != nil {
		sendErrorMessage(c, fmt.Sprintf("AI processing error: %v", err))
		return
	}

	// Log the AI response for debugging
	log.Printf("AI response to user %s: %s", userIDStr, result)

	// Send AI response
	sendMessage(c, WebSocketMessage{
		Type: MessageTypeAIResponse,
		Payload: AIConversationResponse{
			Message: result,
		},
	})
}

// sendMessage sends a WebSocketMessage to the client
func SendMessage(c *websocket.Conn, msg WebSocketMessage) {
	data, err := json.Marshal(msg)
	if err != nil {
		log.Printf("Error marshalling message: %v", err)
		return
	}

	if err := c.WriteMessage(websocket.TextMessage, data); err != nil {
		log.Printf("Error sending message: %v", err)
	}
}

// sendErrorMessage sends an error response
func SendErrorMessage(c *websocket.Conn, errorMsg string) {
	sendMessage(c, WebSocketMessage{
		Type: MessageTypeError,
		Payload: ErrorResponse{
			Message: errorMsg,
		},
	})
}
