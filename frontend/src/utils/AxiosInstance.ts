import { useAuthStore } from "@/stores/authStore";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/api/v1";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().auth.token;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
