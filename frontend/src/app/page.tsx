import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle2,
  BotIcon,
  BarChart2,
  Zap,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-center">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">AI Task Manager</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Sign up</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex items-center justify-center">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Manage Tasks Efficiently with AI
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Streamline your workflow with our AI-powered task management
                  system. Create, assign, and automate tasks with ease.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/dashboard">
                  <Button size="lg" className="w-full min-[400px]:w-auto">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full min-[400px]:w-auto"
                  >
                    Log in
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted flex items-center justify-center">
        <div className="container px-4 md:px-6">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
              Key Features
            </h2>
            <p className="max-w-[85%] text-muted-foreground md:text-xl">
              Our platform offers a comprehensive set of features to help you
              manage tasks efficiently.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
            <Card className="flex flex-col items-center text-center">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <BarChart2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mb-2">Task Dashboard</CardTitle>
                <CardDescription>
                  Get a comprehensive overview of all your tasks with our
                  intuitive dashboard.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="flex flex-col items-center text-center">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <BotIcon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mb-2">AI Automation</CardTitle>
                <CardDescription>
                  Let our AI assistant help you create, prioritize, and manage
                  tasks automatically.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="flex flex-col items-center text-center">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mb-2">Real-time Updates</CardTitle>
                <CardDescription>
                  Stay up-to-date with real-time notifications and task status
                  changes.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 flex items-center justify-center">
        <div className="container px-4 md:px-6">
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Why Choose AI Task Manager?
              </h2>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-semibold">Increased Productivity</h3>
                    <p className="text-muted-foreground">
                      Our AI-powered system helps you focus on what matters
                      most, increasing your productivity by up to 40%.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-semibold">Seamless Collaboration</h3>
                    <p className="text-muted-foreground">
                      Easily assign tasks to team members and track progress in
                      real-time.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-semibold">Smart Prioritization</h3>
                    <p className="text-muted-foreground">
                      Our AI analyzes your workload and helps you prioritize
                      tasks for maximum efficiency.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-semibold">Intuitive Interface</h3>
                    <p className="text-muted-foreground">
                      A clean, modern interface that works seamlessly across all
                      your devices.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="flex justify-center">
              <div className="relative h-[450px] w-[350px] overflow-hidden rounded-lg border bg-background p-4 shadow-lg">
                <div className="absolute inset-0 flex flex-col">
                  <div className="border-b p-4">
                    <div className="h-6 w-24 rounded bg-muted"></div>
                  </div>
                  <div className="flex flex-1 p-4">
                    <div className="w-1/3 border-r pr-4">
                      <div className="space-y-3">
                        <div className="h-4 w-full rounded bg-muted"></div>
                        <div className="h-4 w-full rounded bg-muted"></div>
                        <div className="h-4 w-full rounded bg-muted"></div>
                        <div className="h-4 w-2/3 rounded bg-muted"></div>
                      </div>
                    </div>
                    <div className="flex-1 p-4">
                      <div className="space-y-4">
                        <div className="h-20 rounded bg-muted"></div>
                        <div className="h-20 rounded bg-muted"></div>
                        <div className="h-20 rounded bg-muted"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t py-6 md:py-0 flex items-center justify-center">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} AI Task Manager. All rights
            reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:underline">
              Terms
            </Link>
            <Link href="#" className="hover:underline">
              Privacy
            </Link>
            <Link href="#" className="hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
