import Image from "next/image"
import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-sky-50 via-white to-indigo-50 px-6">
      {/* Soft background blur blob */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
      </div>

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-6 rounded-3xl border border-white/80 bg-white/80 px-8 py-10 shadow-[0_24px_80px_-28px_rgba(15,23,42,0.20)] backdrop-blur-md">
        {/* Vidya Saathi Learning logo — large, centered */}
        <div className="relative h-52 w-full">
          <Image
            src="/vidya-saathi-loading.png"
            alt="Vidya Saathi Learning"
            fill
            sizes="320px"
            className="object-contain drop-shadow-md"
            priority
          />
        </div>

        <p className="text-center text-sm font-medium text-muted-foreground">
          Loading your learning experience…
        </p>

        {/* Loading button */}
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md opacity-95 cursor-not-allowed"
          aria-live="polite"
          aria-busy="true"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </button>
      </div>
    </div>
  )
}
