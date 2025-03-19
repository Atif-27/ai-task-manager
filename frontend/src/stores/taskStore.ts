import { Task } from "@/types/entity";
import { create } from "zustand";

interface TaskStore {
  tasks: Task[];
  userTasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setTasks: (tasks: Task[]) => void;
  setUserTasks: (tasks: Task[]) => void;
  addUserTask: (task: Task) => void;
  updateUserTask: (id: string, updates: Partial<Task>) => void;
  deleteUserTask: (id: string) => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  userTasks: [],

  // General tasks operations
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    })),
  deleteTask: (id) =>
    set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) })),
  setTasks: (tasks) => set({ tasks }),

  // User tasks operations
  setUserTasks: (userTasks) => set({ userTasks }),
  addUserTask: (task) =>
    set((state) => ({ userTasks: [...state.userTasks, task] })),
  updateUserTask: (id, updates) =>
    set((state) => ({
      userTasks: state.userTasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    })),
  deleteUserTask: (id) =>
    set((state) => ({
      userTasks: state.userTasks.filter((task) => task.id !== id),
    })),
}));