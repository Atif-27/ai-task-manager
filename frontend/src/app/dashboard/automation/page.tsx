"use client"

import { AIChat } from "@/components/dashboard/AiChat";

export default function AutomationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Automation</h1>
        <p className="text-muted-foreground">Use AI to automate task management and get recommendations.</p>
      </div>

      <AIChat />
    </div>
  )
}


