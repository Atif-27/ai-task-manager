package main

import (
	"log"
	"os"

	"github.com/Atif-27/ai-task-manager/api"
	"github.com/Atif-27/ai-task-manager/database"
	"github.com/Atif-27/ai-task-manager/middleware"
	"github.com/Atif-27/ai-task-manager/ws"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/websocket/v2"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()
	database.ConnectDB()

	var (
		app = fiber.New()
		//Handlers
		userHandler = api.MakeUserHandler()
		taskHandler = api.MakeTaskHandler()
	)
	origin:= os.Getenv("ORIGIN_URL")
	app.Use(cors.New(cors.Config{
		AllowOrigins:     origin,
		AllowHeaders:     "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With",
		AllowMethods:     "GET, POST, PUT, DELETE, OPTIONS",
		AllowCredentials: true,
	}))
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Health check")
	})
	apiV1 := app.Group("/api/v1")
	apiV1.Post("/register", userHandler.Register)
	apiV1.Post("/login", userHandler.Login)
	apiV1.Get("/users", userHandler.GetAllUsers)

	apiV1.Post("/tasks", middleware.AuthMiddleware, taskHandler.CreateTask)
	apiV1.Delete("/tasks/:id", middleware.AuthMiddleware, taskHandler.DeleteTask)
	apiV1.Put("/tasks/:id", middleware.AuthMiddleware, taskHandler.UpdateTask)
	apiV1.Get("/tasks", middleware.AuthMiddleware, taskHandler.GetAllTasks)
	apiV1.Get("/tasks/me", middleware.AuthMiddleware, taskHandler.GetUserTasks)
	apiV1.Get("/tasks/:id", taskHandler.GetTaskByID)

	apiV1.Get("/ws", websocket.New(ws.HandleWebSocketConnection))
	port := os.Getenv("PORT")
	log.Fatal(app.Listen(":" + port))
}
