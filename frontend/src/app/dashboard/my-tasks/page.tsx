'use client'
import { useState, useEffect } from "react"
import Link from "next/link"
import { PlusCircle, Brain, ArrowUp, ArrowRight, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import api from "@/utils/AxiosInstance"
import { Task } from "@/types/entity" // Assuming you have a Task type defined in "@/types"
import { useTaskStore } from "@/stores/taskStore";

export default function MyTasksPage() {
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const {setUserTasks, userTasks: tasks}= useTaskStore()
useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get<{ tasks: Task[] }>("/tasks/me")
        console.log(res);
        const userTasksData = res.data.tasks || [];
        setUserTasks(userTasksData); // Add this to update the global store
      } catch (error) {
        console.error("Failed to fetch tasks:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchTasks()
  }, [])

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         task.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "in-progress" && task.status === "in_progress") ||
                         task.status === statusFilter
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const tasksByStatus = {
    pending: filteredTasks.filter(task => task.status === "pending"),
    in_progress: filteredTasks.filter(task => task.status === "in_progress"),
    completed: filteredTasks.filter(task => task.status === "completed")
  }

  const taskCounts = {
    pending: tasks.filter(task => task.status === "pending").length,
    in_progress: tasks.filter(task => task.status === "in_progress").length,
    completed: tasks.filter(task => task.status === "completed").length
  }

  const highPriorityTasks = tasks
    .filter(task => task.priority === "high")
    .slice(0, 2)

  

  // Render priority badge with appropriate color
  const PriorityBadge = ({ priority }: { priority: "low" | "medium" | "high" }) => {
    const colorMap = {
      low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
      high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    }
    
    return (
      <Badge className={`${colorMap[priority]} capitalize`} variant="outline">
        {priority}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Tasks</h1>
          <p className="text-muted-foreground">View and manage tasks assigned to you</p>
        </div>
        <Button asChild className="transition-all duration-300 hover:shadow-md">
          <Link href="/dashboard/tasks/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Task
          </Link>
        </Button>
      </div>

      {highPriorityTasks.length > 0 && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary animate-pulse-subtle" />
              <CardTitle>AI Task Recommendations</CardTitle>
            </div>
            <CardDescription>{`Based on your priorities, here's what you should focus on`}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {highPriorityTasks.map(task => (
                <div key={task.id} className="flex items-start gap-3 p-3 bg-background rounded-md border transition-all duration-300 hover:shadow-md">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ArrowUp className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-medium">{task.title}</h3>
                   
                  </div>
                  <Button variant="outline" size="sm" className="ml-auto" asChild>
                    <Link href={`/dashboard/tasks/${task.id}`}>
                      View <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card
          className="gradient-card from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 animate-slide-in-bottom"
          style={{ animationDelay: "0.1s" }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-8" /> : taskCounts.pending}</div>
          </CardContent>
        </Card>
        <Card
          className="gradient-card from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 animate-slide-in-bottom"
          style={{ animationDelay: "0.2s" }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-8" /> : taskCounts.in_progress}</div>
          </CardContent>
        </Card>
        <Card
          className="gradient-card from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 animate-slide-in-bottom"
          style={{ animationDelay: "0.3s" }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-8" /> : taskCounts.completed}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">Task List</h2>
            <p className="text-sm text-muted-foreground">All tasks assigned to you</p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex items-center gap-2 relative">
              <Search className="absolute left-2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                className="h-9 w-full pl-8 sm:w-[200px] transition-all duration-300 focus:border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-full sm:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-9 w-full sm:w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Tabs defaultValue="list" className="animate-fade-in">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="board">Board View</TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="mt-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="rounded-md border p-4">
                    <Skeleton className="h-6 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                ))}
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No tasks found matching your filters</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-background rounded-md border transition-all duration-300 hover:shadow-md hover:border-primary/30">
                    <div className="space-y-1">
                      <h3 className="font-medium">{task.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{task.description}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <Badge variant="secondary" className="capitalize">
                          {task.status === "in_progress" ? "In Progress" : task.status}
                        </Badge>
                        <PriorityBadge priority={task.priority} />
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/tasks/${task.id}`}>
                        View <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="board" className="mt-4">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Pending Column */}
              <Card>
                <CardHeader className="bg-muted/50 pb-3">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <CardDescription>{tasksByStatus.pending.length} tasks</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2 p-2 max-h-[400px] overflow-y-auto">
                  {loading ? (
                    <>
                      <Skeleton className="h-24 w-full rounded-md" />
                      <Skeleton className="h-24 w-full rounded-md" />
                    </>
                  ) : tasksByStatus.pending.length === 0 ? (
                    <div className="text-center py-6 text-sm text-muted-foreground">
                      No pending tasks
                    </div>
                  ) : (
                    tasksByStatus.pending.map(task => (
                      <Link key={task.id} href={`/dashboard/tasks/${task.id}`} className="block">
                        <div className="rounded-md border p-3 transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-primary/50">
                          <h3 className="font-medium truncate">{task.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                          <div className="mt-2">
                            <PriorityBadge priority={task.priority} />
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </CardContent>
              </Card>
              
              {/* In Progress Column */}
              <Card>
                <CardHeader className="bg-muted/50 pb-3">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <CardDescription>{tasksByStatus.in_progress.length} tasks</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2 p-2 max-h-[400px] overflow-y-auto">
                  {loading ? (
                    <>
                      <Skeleton className="h-24 w-full rounded-md" />
                      <Skeleton className="h-24 w-full rounded-md" />
                    </>
                  ) : tasksByStatus.in_progress.length === 0 ? (
                    <div className="text-center py-6 text-sm text-muted-foreground">
                      No tasks in progress
                    </div>
                  ) : (
                    tasksByStatus.in_progress.map(task => (
                      <Link key={task.id} href={`/dashboard/tasks/${task.id}`} className="block">
                        <div className="rounded-md border p-3 transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-primary/50">
                          <h3 className="font-medium truncate">{task.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                          <div className="mt-2">
                            <PriorityBadge priority={task.priority} />
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </CardContent>
              </Card>
              
              {/* Completed Column */}
              <Card>
                <CardHeader className="bg-muted/50 pb-3">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CardDescription>{tasksByStatus.completed.length} tasks</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2 p-2 max-h-[400px] overflow-y-auto">
                  {loading ? (
                    <>
                      <Skeleton className="h-24 w-full rounded-md" />
                      <Skeleton className="h-24 w-full rounded-md" />
                    </>
                  ) : tasksByStatus.completed.length === 0 ? (
                    <div className="text-center py-6 text-sm text-muted-foreground">
                      No completed tasks
                    </div>
                  ) : (
                    tasksByStatus.completed.map(task => (
                      <Link key={task.id} href={`/dashboard/tasks/${task.id}`} className="block">
                        <div className="rounded-md border p-3 transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-primary/50">
                          <h3 className="font-medium truncate">{task.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                          <div className="mt-2">
                            <PriorityBadge priority={task.priority} />
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}