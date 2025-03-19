"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "@/utils/AxiosInstance";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowLeft, Check, ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PriorityType, StatusType } from "@/types/constants";
import { User } from "@/types/entity";

export default function TaskForm() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: StatusType.PENDING,
    priority: PriorityType.MEDIUM,
    assigned_to: [] as string[],
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/users");
        if (response.data.status === "success") {
          setUsers(response.data.users);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleUserSelection = (userId: string) => {
    setFormData((prev) => {
      const isSelected = prev.assigned_to.includes(userId);
      return {
        ...prev,
        assigned_to: isSelected
          ? prev.assigned_to.filter((id) => id !== userId)
          : [...prev.assigned_to, userId],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log(formData);
      await axios.post("/tasks", formData);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Add Task</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Add Task</CardTitle>
          <CardDescription>Add the details of your task</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="grid gap-3">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={StatusType.PENDING}>Pending</SelectItem>
                    <SelectItem value={StatusType.IN_PROGRESS}>
                      In Progress
                    </SelectItem>
                    <SelectItem value={StatusType.COMPLETED}>
                      Completed
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    handleSelectChange("priority", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PriorityType.LOW}>Low</SelectItem>
                    <SelectItem value={PriorityType.MEDIUM}>Medium</SelectItem>
                    <SelectItem value={PriorityType.HIGH}>High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3">
              <Label>Assign Users</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-between">
                    {formData.assigned_to.length > 0
                      ? `${formData.assigned_to.length} user(s) selected`
                      : "Select users"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  {loading ? (
                    <div className="p-4 text-center">Loading users...</div>
                  ) : users.length === 0 ? (
                    <div className="p-4 text-center">No users found</div>
                  ) : (
                    users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center p-2 cursor-pointer"
                        onClick={() => toggleUserSelection(user.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.assigned_to.includes(user.id)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <Avatar className="mr-2 h-6 w-6">
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {user.name}
                      </div>
                    ))
                  )}
                </PopoverContent>
              </Popover>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.assigned_to.map((userId) => {
                  const user = users.find((u) => u.id === userId);
                  return user ? (
                    <Badge
                      key={user.id}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Avatar className="h-4 w-4">
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {user.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit">Create Task</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}