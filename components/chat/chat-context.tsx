"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { api } from "@/lib/api"

export type Message = {
    id: string
    role: "user" | "ai"
    content: string
    timestamp: Date
    language: string
}

type ChatContextType = {
    messages: Message[]
    sendMessage: (text: string, language: string) => Promise<void>
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    isLoading: boolean
    clearChat: () => void
    currentLanguage: string
    setCurrentLanguage: (lang: string) => void
    followUpQuestions: string[]
    suggestedActions: string[]
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function GlobalChatProvider({ children }: { children: ReactNode }) {
    const [messages, setMessages] = useState<Message[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [currentLanguage, setCurrentLanguage] = useState("English")
    const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([])
    const [suggestedActions, setSuggestedActions] = useState<string[]>([])
    const pathname = usePathname()
    const { user } = useAuth() || { user: null }

    // Detect context change (page change)
    useEffect(() => {
        // Optionally send context change event to AI
        console.log("Chat context updated to:", pathname)
    }, [pathname])

    const sendMessage = async (text: string, language: string) => {
        const userMsg: Message = {
            id: Math.random().toString(36).substr(2, 9),
            role: "user",
            content: text,
            timestamp: new Date(),
            language,
        }

        setMessages((prev) => [...prev, userMsg])
        setIsLoading(true)

        try {
            console.log("Chat Request Payload:", {
                message: text,
                language,
                user_id: user?.id,
                role: user?.role || "student",
                context: pathname,
            })

            const resp = await api.post("/chat/message", {
                message: text,
                language,
                user_id: user?.id,
                role: user?.role || "student",
                context: pathname,
            })

            console.log("Chat Response Object:", resp.data)

            const aiMsg: Message = {
                id: Math.random().toString(36).substr(2, 9),
                role: "ai",
                content: resp.data.reply,
                timestamp: new Date(),
                language,
            }
            setMessages((prev) => [...prev, aiMsg])
            setFollowUpQuestions(resp.data.follow_up_questions || [])
            setSuggestedActions(resp.data.suggested_actions || [])
        } catch (error: any) {
            console.error("Chat error:", error)
            const errorMsg: Message = {
                id: Math.random().toString(36).substr(2, 9),
                role: "ai",
                content: `⚠️ Error: ${error.message || "Request failed"}. (Check if your backend is running and accessible at the expected URL)`,
                timestamp: new Date(),
                language,
            }
            setMessages((prev) => [...prev, errorMsg])
        } finally {
            setIsLoading(false)
        }
    }


    const clearChat = () => setMessages([])

    return (
        <ChatContext.Provider
            value={{
                messages,
                sendMessage,
                isOpen,
                setIsOpen,
                isLoading,
                clearChat,
                currentLanguage,
                setCurrentLanguage,
                followUpQuestions,
                suggestedActions,
            }}
        >
            {children}
        </ChatContext.Provider>
    )
}

export function useGlobalChat() {
    const context = useContext(ChatContext)
    if (context === undefined) {
        throw new Error("useGlobalChat must be used within a GlobalChatProvider")
    }
    return context
}
