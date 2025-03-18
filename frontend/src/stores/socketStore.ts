"use client";
import { create } from "zustand";
import { useAuthStore } from "./authStore";

interface SocketState {
  socket: WebSocket | null;
  connect: (url: string) => void;
  disconnect: () => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  socket: null,

  connect: (url: string) => {
    const token = useAuthStore.getState().auth.token;
    
    const ws = new WebSocket(url+"?token="+token!);

    ws.onopen = () => {
      console.log("WebSocket connected");
      set({ socket: ws });
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      set({ socket: null });
    };

    ws.onerror = (error) => {
      console.log("WebSocket error:", error);
    };

    set({ socket: ws });
  },

  disconnect: () => {
    set((state) => {
      state.socket?.close();
      return { socket: null };
    });
  },
}));
