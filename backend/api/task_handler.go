package api

import (
	"time"

	"github.com/Atif-27/ai-task-manager/database"
	"github.com/Atif-27/ai-task-manager/models"
	"github.com/Atif-27/ai-task-manager/ws"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
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

func (t *TaskHandler) CreateTask(c *fiber.Ctx) error {
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
	if task.AssignedTo == nil {
		task.AssignedTo = []primitive.ObjectID{}
	}
	if !task.Status.ValidateStatus() || !task.Priority.ValidatePriority() {
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

func (t *TaskHandler) UpdateTask(c *fiber.Ctx) error {
	id := c.Params("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid Task ID"})
	}
	var updateData models.UpdateTaskRequest
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request format"})
	}

	updateFields := bson.M{}
	if updateData.Title != nil {
		updateFields["title"] = *updateData.Title
	}
	if updateData.Description != nil {
		updateFields["description"] = *updateData.Description
	}
	if updateData.Status != nil && updateData.Status.ValidateStatus() {
		updateFields["status"] = *updateData.Status
	}
	if updateData.Priority != nil && updateData.Priority.ValidatePriority() {
		updateFields["priority"] = *updateData.Priority
	}
	if updateData.AssignedTo != nil {
		updateFields["assigned_to"] = *updateData.AssignedTo
	}

	if len(updateFields) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "No valid fields to update"})
	}

	updateFields["updated_at"] = time.Now()
	filter := bson.M{"_id": objID}
	update := bson.M{"$set": updateFields}
	_, err = t.taskCollection.UpdateOne(c.Context(), filter, update)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not update task"})
	}

	var updatedTask models.Task
	err = t.taskCollection.FindOne(c.Context(), bson.M{"_id": objID}).Decode(&updatedTask)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not fetch updated task"})
	}

	ws.WSManager.Broadcast(fiber.Map{"event": "task_updated", "task_id": id, "updates": updatedTask})
	return c.JSON(fiber.Map{"message": "Task updated", "updated_fields": updatedTask})
}

func (t *TaskHandler) DeleteTask(c *fiber.Ctx) error {
	id := c.Params("id")

	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid Task ID"})
	}

	filter := bson.M{"_id": oid}
	result, err := t.taskCollection.DeleteOne(c.Context(), filter)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not delete task"})
	}

	if result.DeletedCount == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Task not found"})
	}

	go ws.WSManager.Broadcast(fiber.Map{"event": "task_deleted", "task_id": id})

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Task deleted", "task_id": id})
}

func (t *TaskHandler) GetAllTasks(c *fiber.Ctx) error {
	var tasks []models.Task
	cursor, err := t.taskCollection.Find(c.Context(), bson.M{})

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not fetch tasks"})
	}

	if err := cursor.All(c.Context(), &tasks); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to parse tasks"})
	}

	return c.JSON(fiber.Map{"tasks": tasks})
}

func (t *TaskHandler) GetUserTasks(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(primitive.ObjectID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var tasks []models.Task
	filter := bson.M{"assigned_to": userID}
	cursor, err := t.taskCollection.Find(c.Context(), filter)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not fetch assigned tasks"})
	}
	if err := cursor.All(c.Context(), &tasks); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to parse assigned tasks"})
	}

	return c.JSON(fiber.Map{"tasks": tasks})
}
