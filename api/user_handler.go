package api

import (
	"github.com/Atif-27/ai-task-manager/database"
	"github.com/Atif-27/ai-task-manager/models"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

type UserHandler struct {
	userCollection *mongo.Collection
}

// Constructor function for UserHandler
func MakeUserHandler() *UserHandler {
	return &UserHandler{
		userCollection: database.GetCollection("user"),
	}
}

func (u *UserHandler) Register(c *fiber.Ctx) error {
	var user models.User
	if err := c.BodyParser(&user); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	user.Password = string(hashedPassword)
	_, err := u.userCollection.InsertOne(c.Context(), user)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not register"})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": "User registered successfully"})
}
