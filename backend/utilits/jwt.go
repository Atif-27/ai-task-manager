package utils

import (
	"time"

	"os"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func GenerateToken(user_id string,email string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": user_id,
		"email": email,
		"exp":   time.Now().Add(time.Hour * 72).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}

func ExtractUserID(tokenStr string) (primitive.ObjectID, error) {
	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})

	if err != nil || !token.Valid {
		return primitive.NilObjectID, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return primitive.NilObjectID, err
	}
	userID, err := primitive.ObjectIDFromHex(claims["user_id"].(string))
	if err != nil {
		return primitive.NilObjectID, err
	}

	return userID, nil
}
