"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/utils/AxiosInstance";
import { useTaskStore } from "@/stores/taskStore";
import { Task } from "@/types/entity";
import { TaskList } from "@/components/dashboard/TaskList";
import { useRouter } from "next/navigation";
// import { TaskList } from "@/components/dashboard/TaskList";

export default function DashboardPage() {
  const { tasks, setTasks } = useTaskStore();
  const stats = {
    total: tasks.length,
    pending: tasks.filter((task) => task.status === "pending").length,
    inProgress: tasks.filter((task) => task.status === "in_progress").length,
    completed: tasks.filter((task) => task.status === "completed").length,
  };

  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await api.get("/tasks");
        if (Array.isArray(response.data.tasks)) {
          setTasks(response.data.tasks);
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      }
    }

    fetchTasks();
  }, [setTasks]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center slide-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your tasks and track your progress
          </p>
        </div>
        <Button asChild className="button-hover">
          <Link href="/dashboard/tasks/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Task
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 fade-in">
        <TaskCard
          title="Total Tasks"
          count={stats.total}
          change="+2 from yesterday"
        />
        <TaskCard
          title="Pending"
          count={stats.pending}
          change="-1 from yesterday"
        />
        <TaskCard
          title="In Progress"
          count={stats.inProgress}
          change="+3 from yesterday"
        />
        <TaskCard
          title="Completed"
          count={stats.completed}
          change="+0 from yesterday"
        />
      </div>

      <div className="space-y-4 scale-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">All Tasks</h2>
            <p className="text-sm text-muted-foreground">
              View and manage all your tasks
            </p>
          </div>
        </div>

        <Tabs defaultValue="list">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="board">Board View</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-4">
            <TaskList />
          </TabsContent>

          {/* Board View (Example) */}
          <TabsContent value="board" className="mt-4">
            <div className="grid gap-6 md:grid-cols-3">
              <TaskBoard
                title="Pending"
                tasks={tasks.filter((task) => task.status === "pending")}
              />
              <TaskBoard
                title="In Progress"
                tasks={tasks.filter((task) => task.status === "in_progress")}
              />
              <TaskBoard
                title="Completed"
                tasks={tasks.filter((task) => task.status === "completed")}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// TaskCard Component with Type Annotations
interface TaskCardProps {
  title: string;
  count: number;
  change: string;
}

function TaskCard({ title, count, change }: TaskCardProps) {
  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
        <p className="text-xs text-muted-foreground">{change}</p>
      </CardContent>
    </Card>
  );
}

// TaskBoard Component with Type Annotations
interface TaskBoardProps {
  title: string;
  tasks: Task[];
}

function TaskBoard({ title, tasks }: TaskBoardProps) {
  const router = useRouter();
  return (
    <Card>
      <CardHeader className="bg-muted/50 pb-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <CardDescription>{tasks.length} tasks</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 p-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="rounded-md border p-3 card-hover cursor-pointer"
            onClick={() => {
              router.push("/dashboard/tasks/" + task.id);
            }}
          >
            <h3 className="font-medium">{task.title}</h3>
            <p className="text-sm text-muted-foreground">{task.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
