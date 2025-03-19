"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { useTaskStore } from "@/stores/taskStore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PriorityType, StatusType } from "@/types/constants";

export function TaskList() {
  const { tasks } = useTaskStore();

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className="p-4 card-hover">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div>
                <Link
                  href={`/dashboard/tasks/${task.id}`}
                  className="font-medium hover:underline transition-colors"
                >
                  {task.title}
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Badge
                    variant={
                      task.status === StatusType.COMPLETED
                        ? "default"
                        : task.status === StatusType.IN_PROGRESS
                        ? "secondary"
                        : "outline"
                    }
                    className={`
    ${task.status === StatusType.PENDING ? "status-pending" : ""}
    ${task.status === StatusType.IN_PROGRESS ? "status-in-progress" : ""}
    ${task.status === StatusType.COMPLETED ? "status-completed" : ""}
  `}
                  >
                    {task.status}
                  </Badge>

                  <Badge
                    variant={
                      task.priority === PriorityType.HIGH
                        ? "destructive"
                        : task.priority === PriorityType.MEDIUM
                        ? "secondary"
                        : "outline"
                    }
                    className={`
    ${task.priority === PriorityType.LOW ? "priority-low" : ""}
    ${task.priority === PriorityType.MEDIUM ? "priority-medium" : ""}
    ${task.priority === PriorityType.HIGH ? "priority-high" : ""}
  `}
                  >
                    {task.priority}
                  </Badge>
                  <span>
                    Updated {new Date(task.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 transition-transform hover:scale-110">
                {/* <AvatarFallback>
                  {task.assignedTo
                    .split(" ")
                    .map((name) => name[0])
                    .join("")}
                </AvatarFallback> */}
              </Avatar>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="transition-transform hover:scale-110"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/tasks/${task.id}`}>
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/tasks/${task.id}/edit`}>
                      Edit Task
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    Delete Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
