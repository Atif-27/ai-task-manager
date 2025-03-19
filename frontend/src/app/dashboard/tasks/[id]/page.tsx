'use client'
import Link from "next/link";
import { useState, useEffect } from "react";
import api from "@/utils/AxiosInstance";
import { ArrowLeft, Clock, Edit, Trash2, User, Brain, Sparkles } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Task } from "@/types/entity";
import { AxiosError } from "axios";
import { useParams } from "next/navigation";

export default function TaskDetailsPage() {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
    const params= useParams()
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await api.get(`/tasks/${params.id}`);
        setTask(response.data.task);
      } catch (err) {
        if (err instanceof AxiosError)
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [params.id]);

  if (loading) return <p>Loading...</p>;
  if (error || !task) return <p>Invalid ID</p>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="transition-all duration-300 hover:bg-primary/10">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Task Details</h1>
      </div>
      <Card className="transition-all duration-300 hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{task.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                <Badge variant={task.status === "completed" ? "default" : "secondary"} className="transition-all duration-300 hover:opacity-80">
                  {task.status}
                </Badge>
                <Badge variant={task.priority === "high" ? "destructive" : "secondary"} className="transition-all duration-300 hover:opacity-80">
                  {task.priority}
                </Badge>
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" asChild className="transition-all duration-300 hover:bg-primary/10">
                <Link href={`/dashboard/tasks/${task.id}/edit`}>
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="destructive" size="icon" className="transition-all duration-300 hover:opacity-90">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-muted-foreground">{task.description}</p>
          </div>
          <Separator />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <User className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium">Assigned To</h3>
              </div>
              {task.assigned_to.length > 2 ? (
                <Popover>
                  <PopoverTrigger>
                    <Button variant="outline">View Assignees</Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    {task.assigned_to.map((assignee, index) => (
                      <p key={index}>{assignee}</p>
                    ))}
                  </PopoverContent>
                </Popover>
              ) : (
                task.assigned_to.map((assignee, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 transition-transform duration-300 hover:scale-110">
                      <AvatarFallback className="bg-primary/10 text-primary">{assignee[0]}</AvatarFallback>
                    </Avatar>
                    <span>{assignee}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          <Separator />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium">Created At</h3>
              </div>
              <p className="text-muted-foreground">{new Date(task.created_at).toLocaleString()}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium">Updated At</h3>
              </div>
              <p className="text-muted-foreground">{new Date(task.updated_at).toLocaleString()}</p>
            </div>
          </div>
          <Card className="bg-primary/5 border-primary/20 animate-fade-in">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <CardTitle className="text-sm font-medium">AI Task Breakdown</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full justify-start gap-2 transition-all duration-300 hover:bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Break down this task into smaller steps</span>
              </Button>
            </CardContent>
          </Card>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild className="transition-all duration-300 hover:bg-primary/10">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
          <Button asChild className="transition-all duration-300 hover:shadow-md">
            <Link href={`/dashboard/tasks/${task.id}/edit`}>Edit Task</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
