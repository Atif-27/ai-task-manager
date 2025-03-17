package database

import (
	"context"
	"log"
	"os"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var DB *mongo.Client

func ConnectDB() {
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		log.Fatal("ENV ERROR: MONGO_URI not set")
	}
	port := os.Getenv("PORT")
	if port == "" {
		log.Fatal("ENV ERROR: PORT is not set")
	}
	client, err := mongo.Connect(context.TODO(), options.Client().ApplyURI(os.Getenv("MONGO_URI")))
	if err != nil {
		log.Fatal(err)
	}
	log.Println("Connected to MongoDB")
	DB = client
}

func GetCollection(collectionName string) *mongo.Collection {
	if DB == nil {
		log.Fatal("MongoDB client is not initialized. Call ConnectDB() first.")
	}
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		log.Fatal("DB_NAME environment variable is not set")
	}
	return DB.Database(os.Getenv("DB_NAME")).Collection(collectionName)
}
