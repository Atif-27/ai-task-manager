package ws

import (
	"sync"

	"github.com/gofiber/websocket/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Client struct {
	Conn   *websocket.Conn
	UserID primitive.ObjectID
}

type WebSocketManager struct {
	clients map[primitive.ObjectID][]*Client
	mutex   sync.Mutex
}
var WSManager = WebSocketManager{
	clients: make(map[primitive.ObjectID][]*Client),
}

func (w *WebSocketManager) RegisterClient(conn *websocket.Conn, userID primitive.ObjectID) {
	w.mutex.Lock()
	defer w.mutex.Unlock()

	w.clients[userID] = append(w.clients[userID], &Client{Conn: conn, UserID: userID})
}

func (w *WebSocketManager) RemoveClient(conn *websocket.Conn, userID primitive.ObjectID) {
	w.mutex.Lock()
	defer w.mutex.Unlock()

	connections := w.clients[userID]
	for i, c := range connections {
		if c.Conn == conn {
			w.clients[userID] = append(connections[:i], connections[i+1:]...)
			break
		}
	}

	if len(w.clients[userID]) == 0 {
		delete(w.clients, userID)
	}
}