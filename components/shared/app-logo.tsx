"use client"

import Image from "next/image"
import Link from "next/link"
import { Brain } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface AppLogoProps {
  href?: string
  showText?: boolean
  textClassName?: string
  iconClassName?: string
  imageClassName?: string
  wrapperClassName?: string
  size?: number
}

export function AppLogo({
  href = "/",
  showText = true,
  textClassName,
  iconClassName,
  imageClassName,
  wrapperClassName,
  size = 36,
}: AppLogoProps) {
  const [imageFailed, setImageFailed] = useState(false)

  const content = (
    <>
      {/* Logo image — brain/book hexagon badge */}
      <div
        className={cn("flex items-center justify-center", iconClassName)}
        style={{ width: size, height: size }}
      >
        {imageFailed ? (
          <div className="flex items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 shadow-sm" style={{ width: size, height: size }}>
            <Brain className="h-4 w-4 text-white" />
          </div>
        ) : (
          <Image
            src="/vidya-saathi-logo.png"
            alt="Vidya Saathi logo"
            width={size}
            height={size}
            className={cn("object-contain drop-shadow-sm", imageClassName)}
            onError={() => setImageFailed(true)}
            unoptimized
          />
        )}
      </div>
      {showText && (
        <span
          className={cn("font-bold tracking-tight text-foreground", textClassName)}
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Vidya Saathi
        </span>
      )}
    </>
  )

  return (
    <Link href={href} className={cn("flex items-center gap-2", wrapperClassName)}>
      {content}
    </Link>
  )
}
