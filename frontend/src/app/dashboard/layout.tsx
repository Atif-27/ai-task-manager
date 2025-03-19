"use client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { HydrationProvider } from "@/provider/HydrationProvider";
import ProtectProvider from "@/provider/ProtectProvider";
import { useAuthStore } from "@/stores/authStore";
import { useSocketStore } from "@/stores/socketStore";
import { useTaskStore } from "@/stores/taskStore";
import { Task } from "@/types/entity";
import React, { useEffect, useState } from "react";

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
  const { auth, checkStat } = useAuthStore();
  const [apiReady, setApiReady] = useState(false);
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL;
  const userId = auth.userId;
  const isAuthenticated = auth.isLoggedIn;
  // First, check if the authentication is ready
  useEffect(() => {
    if (isAuthenticated) {
      // Simulate or verify API readiness
      // You can replace this with actual API check if needed
      const checkApiStatus = async () => {
        try {
          await checkStat();
          setApiReady(true);
        } catch (error) {
          console.error("Failed to check API status:", error);
        }
      };

      checkApiStatus();
    }
  }, [isAuthenticated]);

  // Only establish WebSocket connection when both auth and API are ready
  useEffect(() => {
    if (WS_URL && !socket && isAuthenticated && apiReady) {
      console.log("Establishing WebSocket connection...");
      connect(WS_URL);
    }

    return () => {
      if (socket) {
        disconnect();
      }
    };
  }, [WS_URL, socket, connect, disconnect, isAuthenticated, apiReady]);

  // WebSocket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      console.log("WebSocket message received");

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
  }, [
    socket,
    addTask,
    updateTask,
    deleteTask,
    addUserTask,
    updateUserTask,
    deleteUserTask,
    userId,
  ]);

  return (
    <div>
      <HydrationProvider>
        <ProtectProvider>
          <DashboardLayout>{children}</DashboardLayout>
        </ProtectProvider>
      </HydrationProvider>
    </div>
  );
};

export default Layout;