"use client"

import React, { useState, useRef, useEffect } from "react"
import {
    Send,
    X,
    Mic,
    Volume2,
    Trash2,
    Loader2,
    MoreHorizontal,
    ChevronRight,
    User,
    Bot
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useGlobalChat } from "./chat-context"
import { cn } from "@/lib/utils"

export function ChatPanel() {
    const {
        isOpen,
        setIsOpen,
        messages,
        sendMessage,
        isLoading,
        clearChat,
        currentLanguage,
        setCurrentLanguage,
        followUpQuestions,
        suggestedActions
    } = useGlobalChat()

    const [inputText, setInputText] = useState("")
    const [isListening, setIsListening] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async () => {
        if (!inputText.trim() || isLoading) return
        const text = inputText
        setInputText("")
        await sendMessage(text, currentLanguage)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }


    const startListening = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (!SpeechRecognition) {
            alert("Speech recognition is not supported in this browser.")
            return
        }

        const recognition = new SpeechRecognition()
        recognition.lang = currentLanguage === "Hindi" ? "hi-IN" : currentLanguage === "Telugu" ? "te-IN" : "en-US"
        recognition.interimResults = false
        recognition.maxAlternatives = 1

        recognition.onstart = () => setIsListening(true)
        recognition.onend = () => setIsListening(false)
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript
            setInputText((prev) => prev + (prev ? " " : "") + transcript)
        }
        recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error)
            setIsListening(false)
        }

        recognition.start()
    }

    const speak = (text: string) => {
        if (!window.speechSynthesis) return
        window.speechSynthesis.cancel() // Stop any current speech
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = currentLanguage === "Hindi" ? "hi-IN" : currentLanguage === "Telugu" ? "te-IN" : "en-US"
        window.speechSynthesis.speak(utterance)
    }

    if (!isOpen) return null

    return (
        <div className={cn(
            "fixed inset-y-0 right-0 z-50 w-full border-l border-border bg-background shadow-2xl transition-all duration-300 sm:w-[400px]",
            isOpen ? "translate-x-0" : "translate-x-full"
        )}>
            {/* Header */}
            <div className="flex h-16 items-center justify-between border-b px-4 py-2 bg-muted/30">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Bot className="h-6 w-6" />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold leading-none">EduTech Assistant</h3>
                        <p className="mt-1 text-xs text-muted-foreground">Ask anything about your lessons</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={clearChat} title="Clear conversation">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => setIsOpen(false)}>
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Language & Settings */}
            <div className="flex items-center justify-between bg-muted/10 px-4 py-2 text-xs border-b">
                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Language:</span>
                    <Select value={currentLanguage} onValueChange={setCurrentLanguage}>
                        <SelectTrigger className="h-7 w-[100px] text-xs">
                            <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="Hindi">Hindi</SelectItem>
                            <SelectItem value="Telugu">Telugu</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Message Area */}
            <ScrollArea className="flex-1 p-4" viewportRef={scrollRef} style={{ height: "calc(100vh - 160px)" }}>
                <div className="flex flex-col gap-4 pb-4">
                    {messages.length === 0 && (
                        <div className="mt-10 flex flex-col items-center justify-center text-center px-6">
                            <div className="mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                                <Bot className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h4 className="font-medium">Welcome to EduTech AI</h4>
                            <p className="mt-2 text-sm text-muted-foreground">
                                I can help you understand topics, practice quizzes, or translate concepts.
                                Type your doubt below in English, Hindi, or Telugu!
                            </p>
                            <div className="mt-6 grid grid-cols-1 gap-2 w-full">
                                <Button variant="outline" size="sm" className="justify-start text-xs font-normal" onClick={() => setInputText("Explain Newton's first law with an example")}>
                                    "Explain Newton's first law..."
                                </Button>
                                <Button variant="outline" size="sm" className="justify-start text-xs font-normal" onClick={() => setInputText("How is my overall mastery in Algebra?")}>
                                    "How is my mastery in Algebra?"
                                </Button>
                            </div>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex max-w-[85%] flex-col gap-1",
                                msg.role === "user" ? "ml-auto items-end" : "items-start"
                            )}
                        >
                            <div className={cn(
                                "rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                                msg.role === "user"
                                    ? "bg-primary text-primary-foreground rounded-tr-none"
                                    : "bg-muted text-foreground rounded-tl-none"
                            )}>
                                {msg.content}
                            </div>
                            <div className="flex items-center gap-2 px-1 text-[10px] text-muted-foreground">
                                <span>{msg.role === "user" ? "You" : "AI"}</span>
                                <span>•</span>
                                <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                {msg.role === "ai" && (
                                    <>
                                        <span>•</span>
                                        <button className="hover:text-primary" onClick={() => speak(msg.content)} title="Listen to response">
                                            <Volume2 className="h-3 w-3" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Follow-up Questions */}
                    {!isLoading && followUpQuestions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {followUpQuestions.map((q, i) => (
                                <Button
                                    key={i}
                                    variant="outline"
                                    size="sm"
                                    className="h-auto py-1.5 px-3 text-xs text-left justify-start rounded-full border-primary/20 hover:bg-primary/5 hover:text-primary hover:border-primary/50"
                                    onClick={() => sendMessage(q, currentLanguage)}
                                >
                                    {q}
                                </Button>
                            ))}
                        </div>
                    )}

                    {/* Suggested Actions */}
                    {!isLoading && suggestedActions.length > 0 && (
                        <div className="flex gap-2 mt-1">
                            {suggestedActions.map((action, i) => (
                                <Badge
                                    key={i}
                                    variant="secondary"
                                    className="cursor-pointer hover:bg-secondary/80 text-[10px]"
                                    onClick={() => setInputText(action)}
                                >
                                    {action}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex items-start gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            </div>
                            <div className="rounded-2xl bg-muted px-4 py-2.5 text-sm italic text-muted-foreground">
                                Assistant is thinking...
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="absolute bottom-0 w-full border-t bg-background p-4">
                <div className="relative flex items-end gap-2">
                    <div className="flex-1 relative">
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Type your question..."
                            className="w-full min-h-[44px] max-h-32 resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <Button
                        size="icon"
                        className={cn(
                            "h-11 w-11 rounded-xl shrink-0 transition-all",
                            inputText.trim() ? "bg-primary" : "bg-muted text-muted-foreground"
                        )}
                        onClick={handleSend}
                        disabled={!inputText.trim() || isLoading}
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                </div>
                <div className="mt-2 flex items-center justify-between px-1">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className={cn(
                            "h-8 w-8 rounded-full hover:bg-primary/10 transition-colors",
                            isListening ? "bg-red-100 text-red-600 animate-pulse" : "hover:text-primary"
                        )}
                        onClick={startListening}
                        title={isListening ? "Listening..." : "Voice input"}
                    >
                        <Mic className="h-4 w-4" />
                    </Button>
                    <span className="text-[10px] text-muted-foreground">
                        Press Enter to send, Shift + Enter for new line
                    </span>
                </div>
            </div>
        </div>
    )
}
