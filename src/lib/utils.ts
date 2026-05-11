import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const longDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  year: "numeric",
})

function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
) {
  return amount.toLocaleString(locale, {
    style: "currency",
    currency,
  })
}

function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions) {
  if (options) {
    return new Date(date).toLocaleDateString("en-US", options)
  }
  return longDateFormatter.format(new Date(date))
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

function calculateTalkListenRatio(talkMs: number, totalMs: number): string {
  const talkPercentage = Math.round((talkMs / totalMs) * 100)
  const listenPercentage = 100 - talkPercentage
  return `${talkPercentage}:${listenPercentage}`
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
