"use client"

import React, { useState, useRef } from "react"
import {
    BookOpen,
    Languages,
    Sparkles,
    Volume2,
    Play,
    Loader2,
    ChevronRight,
    Music,
    CheckCircle2,
    Target,
    Clapperboard
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"

export default function LearnTopicPage() {
    const [topic, setTopic] = useState("")
    const [language, setLanguage] = useState("English")
    const [loading, setLoading] = useState(false)
    const [explanation, setExplanation] = useState<any>(null)
    const [storyboard, setStoryboard] = useState<any>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [activeScene, setActiveScene] = useState(0)

    const audioRef = useRef<HTMLAudioElement | null>(null)

    const handleGenerate = async () => {
        if (!topic.trim()) return
        setLoading(true)
        setExplanation(null)
        setStoryboard(null)
        try {
            const res = await api.post("/learn/topic", { topic, language })
            setExplanation(res.data)
        } catch (error) {
            console.error("Error generating explanation:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleTTS = async () => {
        if (!explanation) return
        setIsPlaying(true)
        try {
            const res = await api.post("/learn/text-to-speech", {
                text: `${explanation.explanation}. ${explanation.example}`,
                language
            }, { responseType: 'blob' })

            const url = window.URL.createObjectURL(new Blob([res.data]))
            if (audioRef.current) {
                audioRef.current.src = url
                audioRef.current.play()
            }
        } catch (error) {
            console.error("Error in TTS:", error)
            setIsPlaying(false)
        }
    }

    const handleGenerateAnimation = async () => {
        if (!topic.trim()) return
        setLoading(true)
        try {
            const res = await api.post("/learn/storyboard", { topic, language })
            setStoryboard(res.data)
            setActiveScene(1)
        } catch (error) {
            console.error("Error generating storyboard:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container max-w-5xl py-10 px-4 min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="flex flex-col items-center text-center mb-10">
                <Badge variant="outline" className="mb-4 px-3 py-1 flex items-center gap-1.5 text-primary border-primary/20 bg-primary/5">
                    <Sparkles className="h-3.5 w-3.5" />
                    FAST Learn AI
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight mb-4">Master Any Topic Instantly</h1>
                <p className="text-muted-foreground max-w-2xl">
                    Enter a topic below to get a multilingual, student-friendly explanation,
                    audio narration, and animated teaching scenes.
                </p>
            </div>

            {/* Input Controls */}
            <Card className="mb-8 border-primary/10 shadow-lg shadow-primary/5">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <label className="text-sm font-medium mb-1.5 block">What do you want to learn?</label>
                            <Input
                                placeholder="e.g. Photosynthesis, Newton's Laws, Civil War..."
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="h-12"
                                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <label className="text-sm font-medium mb-1.5 block">Language</label>
                            <Select value={language} onValueChange={setLanguage}>
                                <SelectTrigger className="h-12">
                                    <SelectValue placeholder="Select Language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="English">English</SelectItem>
                                    <SelectItem value="Hindi">Hindi</SelectItem>
                                    <SelectItem value="Telugu">Telugu</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end">
                            <Button
                                onClick={handleGenerate}
                                size="lg"
                                className="w-full md:w-auto h-12 gap-2 shadow-md shadow-primary/20"
                                disabled={loading || !topic.trim()}
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
                                Generate Learn Plan
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {loading && !explanation && !storyboard && (
                <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-lg font-medium animate-pulse">Our AI Tutor is preparing your lesson...</p>
                </div>
            )}

            {/* Content Display */}
            {explanation && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    {/* Main Explanation */}
                    <Card className="lg:col-span-2 border-primary/5 overflow-hidden">
                        <CardHeader className="bg-primary/5 border-b pb-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-2xl">{topic}</CardTitle>
                                    <CardDescription>Comprehensive simple explanation</CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleTTS}
                                    disabled={isPlaying}
                                    className="gap-2 bg-background hover:bg-primary/5"
                                >
                                    <Volume2 className={cn("h-4 w-4", isPlaying && "animate-pulse")} />
                                    {isPlaying ? "Playing..." : "Listen"}
                                </Button>
                                <audio ref={audioRef} onEnded={() => setIsPlaying(false)} className="hidden" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="prose prose-slate max-w-none">
                                <h3 className="text-lg font-bold flex items-center gap-2 text-primary mb-3">
                                    <ChevronRight className="h-5 w-5" />
                                    Explanation
                                </h3>
                                <p className="text-muted-foreground leading-relaxed mb-6">
                                    {explanation.explanation}
                                </p>

                                <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-600 mb-3">
                                    <Target className="h-5 w-5" />
                                    Real-life Example
                                </h3>
                                <div className="bg-emerald-50 border-emerald-100 border rounded-xl p-4 mb-6">
                                    <p className="text-emerald-900 italic text-sm">
                                        {explanation.example}
                                    </p>
                                </div>

                                <div className="bg-muted/40 rounded-xl p-6">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                                        Summary
                                    </h3>
                                    <p className="font-medium text-slate-800">
                                        {explanation.summary}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sidebar: Key Points and Actions */}
                    <div className="flex flex-col gap-6">
                        <Card className="border-primary/5">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                    Key Takeaways
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <ul className="space-y-3">
                                    {explanation.key_points.map((point: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                                {idx + 1}
                                            </div>
                                            <span className="text-sm">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col gap-3">
                            <Button
                                size="lg"
                                variant="secondary"
                                className="w-full gap-2 h-14 rounded-2xl shadow-sm"
                                onClick={handleGenerateAnimation}
                                disabled={loading}
                            >
                                <Clapperboard className="h-5 w-5" />
                                Generate Animated Scenes
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Storyboard Display */}
            {storyboard && (
                <div className="mt-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Clapperboard className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Concept Animation Storyboard</h2>
                            <p className="text-muted-foreground text-sm">Visual scenes for {topic}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {[1, 2, 3, 4, 5].map((num) => {
                            const sceneKey = `scene_${num}` as keyof typeof storyboard
                            const content = storyboard[sceneKey]
                            return (
                                <Card
                                    key={num}
                                    className={cn(
                                        "relative group transition-all duration-500 overflow-hidden border-primary/10",
                                        activeScene === num ? "ring-2 ring-primary shadow-xl scale-105 z-10" : "opacity-70 hover:opacity-100"
                                    )}
                                    onClick={() => setActiveScene(num)}
                                >
                                    <div className="absolute top-2 left-2 z-20">
                                        <Badge variant="secondary" className="font-mono text-[10px]">SCENE {num}</Badge>
                                    </div>
                                    <div className="h-32 bg-slate-900 flex items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                                        <img
                                            src={`https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&q=80`}
                                            className="object-cover w-full h-full opacity-40 grayscale group-hover:grayscale-0 transition-all"
                                            alt={`Scene ${num}`}
                                        />
                                        <Play className="h-8 w-8 text-white/50 z-20 group-hover:text-white transition-colors" />
                                    </div>
                                    <CardContent className="p-4 h-32 overflow-y-auto bg-card">
                                        <p className="text-xs leading-relaxed font-normal">
                                            {content}
                                        </p>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>

                    {/* Active Scene Detailed View */}
                    <div className="mt-6 p-8 rounded-3xl bg-slate-900 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5">
                            <Sparkles className="h-32 w-32" />
                        </div>
                        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
                            <Badge className="mb-4 bg-primary text-primary-foreground hover:bg-primary">SCENE {activeScene} — ANIMATION ACTION</Badge>
                            <p className="text-xl md:text-2xl font-medium leading-relaxed italic">
                                "{storyboard[`scene_${activeScene}` as keyof typeof storyboard]}"
                            </p>
                            <div className="mt-8 flex gap-2">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "h-1.5 w-12 rounded-full transition-all duration-300",
                                            activeScene === i ? "bg-primary w-20" : "bg-white/20"
                                        )}
                                        onClick={() => setActiveScene(i)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
