"use client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import ProtectProvider from "@/provider/ProtectProvider";
import { useAuthStore } from "@/stores/authStore";
import { useSocketStore } from "@/stores/socketStore";
import { useTaskStore } from "@/stores/taskStore"; // Import task store to update state
import { Task } from "@/types/entity";
import React, { useEffect } from "react";

// Define Task and Event Data Types

interface TaskCreatedEvent {
  event: "task_created";
  task: Task;
}

interface TaskUpdatedEvent {
  event: "task_updated";
  task_id: string;
  updates: Partial<Task>;
}

interface TaskDeletedEvent {
  event: "task_deleted";
  task_id: string;
}

type TaskEvent = TaskCreatedEvent | TaskUpdatedEvent | TaskDeletedEvent;

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { connect, disconnect, socket } = useSocketStore();
  const {
    addTask,
    updateTask,
    deleteTask,
    addUserTask,
    updateUserTask,
    deleteUserTask,
  } = useTaskStore();
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL;

  useEffect(() => {
    if (WS_URL && !socket) {
      connect(WS_URL);
    }

    return () => {
      disconnect();
    };
  }, [WS_URL]);
  const { auth } = useAuthStore();
  const userId = auth.userId;

  useEffect(() => {
    if (!socket) return;

    // WebSocket event handler
    const handleMessage = (event: MessageEvent) => {
      console.log("message");

      try {
        const data: TaskEvent = JSON.parse(event.data);
        switch (data.event) {
          case "task_created":
            if (data.task.assigned_to.includes(userId!)) {
              addUserTask(data.task);
            }
            addTask(data.task);
            break;
          case "task_updated":
            if (
              data.updates.assigned_to &&
              data.updates.assigned_to.includes(userId!)
            ) {
              updateUserTask(data.task_id, data.updates);
            }
            updateTask(data.task_id, data.updates);
            break;
          case "task_deleted":
            deleteTask(data.task_id);
            deleteUserTask(data.task_id);
            break;
          default:
            console.warn("Unknown event type:", data);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket, addTask, updateTask, deleteTask]);

  return (
    <div>
      <ProtectProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </ProtectProvider>
    </div>
  );
};

export default Layout;
