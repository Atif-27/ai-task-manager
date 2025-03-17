package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Task represents a task in the system.
type Task struct {
	ID          primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	Title       string               `bson:"title" json:"title"`
	Description string               `bson:"description" json:"description"`
	AssignedTo  []primitive.ObjectID `bson:"assigned_to" json:"assigned_to"`
	AssignedBy  primitive.ObjectID   `bson:"assigned_by" json:"assigned_by"`
	Status      StatusType           `bson:"status" json:"status"`
	Priority    PriorityType         `bson:"priority" json:"priority"`
	CreatedAt   time.Time            `bson:"created_at,omitempty" json:"created_at"`
	UpdatedAt   time.Time            `bson:"updated_at,omitempty" json:"updated_at"`
	// TODO check if mongodb automatically handle created at and updated at
}

type StatusType string

type PriorityType string

const (
	PENDING    StatusType = "pending"
	INPROGRESS StatusType = "in_progress"
	COMPLETED  StatusType = "completed"
)

const (
	LOW    PriorityType = "low"
	MEDIUM PriorityType = "medium"
	HIGH   PriorityType = "high"
)

func (s StatusType) ValidateStatus() bool {
	switch s {
	case PENDING, INPROGRESS, COMPLETED:
		return true
	default:
		return false
	}
}

func (p PriorityType) ValidatePriority() bool {
	switch p {
	case LOW, MEDIUM, HIGH:
		return true
	default:
		return false
	}
}

type UpdateTaskRequest struct {
	Title       *string               `json:"title,omitempty"`
	Description *string               `json:"description,omitempty"`
	Status      *StatusType           `json:"status,omitempty"`
	Priority    *PriorityType         `json:"priority,omitempty"`
	AssignedTo  *[]primitive.ObjectID `json:"assigned_to,omitempty"`
}
