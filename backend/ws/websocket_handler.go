package ws

import (
	"fmt"
	"log"
	"strings"

	utils "github.com/Atif-27/ai-task-manager/utilits"
	"github.com/gofiber/websocket/v2"
)

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
	)
	for {
		if _, msg, _ = c.ReadMessage(); err != nil {
			log.Println("read:", err)
			break
		}
		log.Printf("recv: %s", msg)
	}
}
