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
    uploadFile: (file: File) => Promise<void>
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
            const resp = await api.post("/chat/message", {
                message: text,
                language,
                user_id: user?.id,
                role: user?.role || "student",
                context: pathname,
            })

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
        } catch (error) {
            console.error("Chat error:", error)
            const errorMsg: Message = {
                id: "error",
                role: "ai",
                content: "Sorry, I encountered an error. Please check your connection.",
                timestamp: new Date(),
                language,
            }
            setMessages((prev) => [...prev, errorMsg])
        } finally {
            setIsLoading(false)
        }
    }

    const uploadFile = async (file: File) => {
        setIsLoading(true)
        const formData = new FormData()
        formData.append("file", file)

        try {
            const resp = await api.post("/chat/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            })

            const systemMsg: Message = {
                id: Math.random().toString(36).substr(2, 9),
                role: "ai",
                content: resp.data.message + " " + (resp.data.detail || ""),
                timestamp: new Date(),
                language: currentLanguage,
            }
            setMessages((prev) => [...prev, systemMsg])
        } catch (error: any) {
            console.error("Upload error:", error)
            const errorMsg: Message = {
                id: "upload-error",
                role: "ai",
                content: `Failed to upload file: ${error.message || "Unknown error"}`,
                timestamp: new Date(),
                language: currentLanguage,
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
                uploadFile
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
