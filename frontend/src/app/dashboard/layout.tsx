"use client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import ProtectProvider from "@/provider/ProtectProvider";
import { useSocketStore } from "@/stores/socketStore";
import { useTaskStore } from "@/stores/taskStore"; // Import task store to update state
import React, { useEffect } from "react";

// Define Task and Event Data Types
interface Task {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  assigned_to: string[];
  assigned_by: string;
  created_at: string;
  updated_at: string;
}

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
  const { addTask, updateTask, deleteTask } = useTaskStore();
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL;

  useEffect(() => {
    if (WS_URL && !socket) {
      connect(WS_URL);
    }

    return () => {
      disconnect();
    };
  }, [WS_URL]);

  useEffect(() => {
    if (!socket) return;

    // WebSocket event handler
    const handleMessage = (event: MessageEvent) => {
      console.log("message");

      try {
        const data: TaskEvent = JSON.parse(event.data);
        switch (data.event) {
          case "task_created":
            addTask(data.task);
            break;
          case "task_updated":
            updateTask(data.task_id, data.updates);
            break;
          case "task_deleted":
            deleteTask(data.task_id);
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
