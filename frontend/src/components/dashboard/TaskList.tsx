import Link from "next/link"
import { MoreHorizontal } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Sample task data
const tasks = [
  {
    id: "1",
    title: "Implement dark mode for the dashboard",
    status: "In Progress",
    priority: "Medium",
    assignedTo: "John Doe",
    createdAt: "2023-03-15T10:30:00Z",
    updatedAt: "2023-03-16T14:45:00Z",
  },
  {
    id: "2",
    title: "Fix login page responsiveness",
    status: "Pending",
    priority: "High",
    assignedTo: "Jane Smith",
    createdAt: "2023-03-14T09:15:00Z",
    updatedAt: "2023-03-14T09:15:00Z",
  },
  {
    id: "3",
    title: "Create user documentation",
    status: "Completed",
    priority: "Low",
    assignedTo: "John Doe",
    createdAt: "2023-03-10T11:45:00Z",
    updatedAt: "2023-03-13T16:30:00Z",
  },
  {
    id: "4",
    title: "Update API endpoints",
    status: "In Progress",
    priority: "Medium",
    assignedTo: "Jane Smith",
    createdAt: "2023-03-12T13:20:00Z",
    updatedAt: "2023-03-15T10:10:00Z",
  },
  {
    id: "5",
    title: "Design new landing page",
    status: "Pending",
    priority: "High",
    assignedTo: "John Doe",
    createdAt: "2023-03-16T08:45:00Z",
    updatedAt: "2023-03-16T08:45:00Z",
  },
]

export function TaskList() {
  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className="p-4 card-hover">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div>
                <Link href={`/dashboard/tasks/${task.id}`} className="font-medium hover:underline transition-colors">
                  {task.title}
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Badge
                    variant={
                      task.status === "Completed" ? "default" : task.status === "In Progress" ? "secondary" : "outline"
                    }
                    className={`${task.status === "Pending" ? "status-pending" : task.status === "In Progress" ? "status-in-progress" : "status-completed"}`}
                  >
                    {task.status}
                  </Badge>
                  <Badge
                    variant={
                      task.priority === "High" ? "destructive" : task.priority === "Medium" ? "secondary" : "outline"
                    }
                    className={`${task.priority === "Low" ? "priority-low" : task.priority === "Medium" ? "priority-medium" : "priority-high"}`}
                  >
                    {task.priority}
                  </Badge>
                  <span>Updated {new Date(task.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 transition-transform hover:scale-110">
                <AvatarFallback>
                  {task.assignedTo
                    .split(" ")
                    .map((name) => name[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="transition-transform hover:scale-110">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/tasks/${task.id}`}>View Details</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/tasks/${task.id}/edit`}>Edit Task</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">Delete Task</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

