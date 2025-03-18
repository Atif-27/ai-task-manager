package ws

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"

	utils "github.com/Atif-27/ai-task-manager/utilits"
	"github.com/gofiber/websocket/v2"
)
type WebSocketMessage struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}
func HandleWebSocketConnection(c *websocket.Conn) {
	fmt.Println("Connection")
	authHeader := c.Headers("Authorization")
	if authHeader == "" {
		log.Println("No Authorization header provided")
		c.Close()
		return
	}

	tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
	userID, err := utils.ExtractUserID(tokenStr)
	if err != nil {
		log.Println("Invalid JWT token")
		c.Close()
		return
	}

	WSManager.RegisterClient(c, userID)
	defer func() {
		WSManager.RemoveClient(c, userID)
		c.Close()
	}()
	var (
		msg []byte
		messageObj WebSocketMessage
	)
	for {
		if _, msg, err = c.ReadMessage(); err != nil {
			log.Println("read error:", err)
			break
		}
		log.Printf("received message: %s", msg)
		if err := json.Unmarshal(msg, &messageObj); err != nil {
			log.Printf("Failed to parse message: %v", err)
			sendErrorMessage(c, "Invalid message format")
			continue
		}
		AutomationWebSocketHandler(c,messageObj,userID)
	}
}


// sendMessage sends a WebSocketMessage to the client
func sendMessage(c *websocket.Conn, msg WebSocketMessage) {
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
func sendErrorMessage(c *websocket.Conn, errorMsg string) {
	sendMessage(c, WebSocketMessage{
		Type: MessageTypeError,
		Payload: ErrorResponse{
			Message: errorMsg,
		},
	})
}
