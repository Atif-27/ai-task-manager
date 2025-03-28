export interface Task {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed";
  priority: string;
  assigned_to: string[];
  assigned_by: string;
  created_at: Date;
  updated_at: Date;
  assigned_to_details?: User[];
}

export interface User {
  id: string;
  name: string;
  email: string;
}