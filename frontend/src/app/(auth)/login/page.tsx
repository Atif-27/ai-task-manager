'use client'
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/utils/AxiosInstance";
import { AxiosError } from "axios";
import { useAuthStore } from "@/stores/authStore";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    password: "",
  });
  const login = useAuthStore((state) => state.login);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await api.post("/login", formData);
      const token = res.data.token;
      login(token);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log("Login error:", error.response?.data);
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black/88 p-4">
      <div className="mb-8 flex flex-col items-center text-center slide-in">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          AI Task Manager
        </h1>
        <p className="text-muted-foreground">Login to your account</p>
      </div>
      <Card className="w-full max-w-md scale-in">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="transition-all focus:scale-[1.01]"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="transition-all focus:scale-[1.01]"
              />
            </div>
            <Button type="submit" className="w-full button-hover">
              Login
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Register
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
