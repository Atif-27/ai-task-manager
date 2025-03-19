"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot } from "lucide-react"
import { useSocketStore } from "@/stores/socketStore"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your AI assistant. How can I help you with task management today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { socket } = useSocketStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!socket) return

    // Listen for AI responses
    const handleSocketMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === "ai_response") {
          const assistantMessage: Message = {
            id: Date.now().toString(),
            content: data.payload.message,
            role: "assistant",
            timestamp: new Date(),
          }
          setMessages(prev => [...prev, assistantMessage])
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error)
      }
    }

    socket.addEventListener("message", handleSocketMessage)

    return () => {
      socket.removeEventListener("message", handleSocketMessage)
    }
  }, [socket])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || !socket) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Send message to AI through socket
    const request = {
      type: "ai_request",
      payload: {
        message: input
      }
    }

    socket.send(JSON.stringify(request))
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="flex h-[calc(100vh-12rem)] flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full p-4">
          <div className="flex flex-col gap-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex max-w-[80%] gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <Avatar className="h-8 w-8">
                    {message.role === "assistant" ? (
                      <>
                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt="AI" />
                        <AvatarFallback>AI</AvatarFallback>
                      </>
                    ) : (
                      <>
                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                        <AvatarFallback>U</AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <div>
                    <div
                      className={`rounded-lg p-3 ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{formatTime(message.timestamp)}</p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex max-w-[80%] gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="AI" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg bg-muted p-3">
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"></div>
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4">
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim() || !socket}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}