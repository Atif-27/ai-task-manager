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
}