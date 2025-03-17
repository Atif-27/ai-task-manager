package api

import (
	"time"

	"github.com/Atif-27/ai-task-manager/database"
	"github.com/Atif-27/ai-task-manager/models"
	"github.com/Atif-27/ai-task-manager/ws"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)
type TaskHandler struct {
	taskCollection *mongo.Collection
}

// Constructor function for TaskHandler
func MakeTaskHandler() *TaskHandler {
	return &TaskHandler{
		taskCollection: database.GetCollection("task"),
	}
}

func(t *TaskHandler) CreateTask(c *fiber.Ctx) error {
	var task models.Task
	if err := c.BodyParser(&task); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}
	if task.Status == "" {
		task.Status = models.PENDING
	}
	if task.Priority == "" {
		task.Priority = models.LOW
	}
	if task.AssignedTo == nil{
		task.AssignedTo = []primitive.ObjectID{}
	}
	if !task.Status.ValidateStatus()  || !task.Priority.ValidatePriority(){
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid Status or priority"})
	}
	task.CreatedAt = time.Now()
	task.UpdatedAt = time.Now()
	_, err := t.taskCollection.InsertOne(c.Context(), task)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not create task"})
	}
	ws.WSManager.Broadcast(fiber.Map{"event": "task_created", "task": task})
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": "Task created", "task": task})
}