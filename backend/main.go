package main

import (
	"log"
	"os"

	"github.com/Atif-27/ai-task-manager/api"
	"github.com/Atif-27/ai-task-manager/database"
	"github.com/gofiber/fiber/v2"
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
	apiV1 := app.Group("/api/v1")
	apiV1.Post("/register", userHandler.Register)
	apiV1.Post("/login", userHandler.Login)
	port := os.Getenv("PORT")
	apiV1.Post("/tasks", taskHandler.CreateTask)
	log.Fatal(app.Listen(":" + port))
}
