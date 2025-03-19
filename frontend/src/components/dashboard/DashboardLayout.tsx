"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  CheckSquare,
  Home,
  LogOut,
  BotIcon as Robot,
  Menu,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/dashboard",
    },
    {
      title: "My Tasks",
      icon: CheckSquare,
      href: "/dashboard/my-tasks",
    },
    {
      title: "Automation",
      icon: Robot,
      href: "/dashboard/automation",
    },
  ];

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground transition-all hover:scale-105">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div className="font-semibold">AI Task Manager</div>
          </div>
          <SidebarSeparator />
          <form className="px-2">
            <div className="relative"></div>
          </form>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.title}
                      className="transition-all hover:translate-x-1"
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Logout"
                className="transition-all hover:translate-x-1"
              >
                <Link href="/auth/login">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="bg-background">
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6 transition-all duration-200">
            {mounted && <>{isMobile ? <MobileMenuButton /> : <></>}</>}
            <div className="ml-auto flex items-center gap-4">
              <Avatar className="h-8 w-8 transition-transform hover:scale-110">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  JD
                </AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6">
            <div className="fade-in">{children}</div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function MobileMenuButton() {
  const { openMobile, setOpenMobile } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setOpenMobile(!openMobile)}
      className="transition-transform hover:scale-110"
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle Menu</span>
    </Button>
  )
}

