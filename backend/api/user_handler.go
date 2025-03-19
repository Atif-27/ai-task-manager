package api

import (
	"fmt"

	"github.com/Atif-27/ai-task-manager/database"
	"github.com/Atif-27/ai-task-manager/models"
	utils "github.com/Atif-27/ai-task-manager/utilits"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
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
	var existingUser models.User
	err := u.userCollection.FindOne(c.Context(), bson.M{"email": user.Email}).Decode(&existingUser)
	if err == nil {
		// Email already exists
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "Email already registered"})
	} 
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	user.Password = string(hashedPassword)
	fmt.Println(user)

	_, err = u.userCollection.InsertOne(c.Context(), user)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not register"})
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": "User registered successfully"})
}

func (u *UserHandler) Login(c *fiber.Ctx) error {
	var input models.User
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}
	fmt.Println(input)
	var user models.User
	err := u.userCollection.FindOne(c.Context(), bson.M{"email": input.Email}).Decode(&user)

	if err == mongo.ErrNoDocuments {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid credentials"})
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password))

	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid credentials"})
	}
	// TODO: Implement cookie based
	token, _ := utils.GenerateToken(user.ID.Hex(), user.Email)
	return c.JSON(fiber.Map{"token": token, "userId": user.ID})
}

func (u *UserHandler) GetAllUsers(c *fiber.Ctx) error {

	opts := options.Find().SetProjection(bson.M{"password": 0})
	cursor, err := u.userCollection.Find(c.Context(), bson.M{}, opts)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch users",
		})
	}
	var users []models.User
	if err := cursor.All(c.Context(), &users); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to decode users",
		})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"count":  len(users),
		"users":  users,
	})
}
