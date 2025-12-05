/**
 * Vapi Client Manager
 *
 * This module provides a singleton VapiManager for client-side call management.
 * It wraps the @vapi-ai/web SDK for browser-based voice calls.
 *
 * NOTE: For assistant configuration, see @/lib/vapi-agents.ts
 * This file only handles client-side call lifecycle management.
 */

import Vapi from '@vapi-ai/web'

if (!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY) {
  throw new Error('NEXT_PUBLIC_VAPI_PUBLIC_KEY is not set')
}

class VapiManager {
  private vapi: Vapi | null = null
  private isInitialized = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!)
      this.isInitialized = true
    }
  }

  isReady(): boolean {
    return this.isInitialized && this.vapi !== null
  }

  async startCall(assistantId: string): Promise<void> {
    if (!this.vapi) {
      throw new Error('Vapi not initialized')
    }

    return this.vapi.start(assistantId)
  }

  async stopCall(): Promise<void> {
    if (!this.vapi) {
      throw new Error('Vapi not initialized')
    }

    return this.vapi.stop()
  }

  onMessage(handler: (message: any) => void): void {
    if (!this.vapi) return
    this.vapi.on('message', handler)
  }

  onCallStart(handler: () => void): void {
    if (!this.vapi) return
    this.vapi.on('call-start', handler)
  }

  onCallEnd(handler: (callData: any) => void): void {
    if (!this.vapi) return
    this.vapi.on('call-end', handler)
  }

  onSpeechStart(handler: () => void): void {
    if (!this.vapi) return
    this.vapi.on('speech-start', handler)
  }

  onSpeechEnd(handler: () => void): void {
    if (!this.vapi) return
    this.vapi.on('speech-end', handler)
  }

  onError(handler: (error: any) => void): void {
    if (!this.vapi) return
    this.vapi.on('error', handler)
  }

  removeAllListeners(): void {
    if (!this.vapi) return
    this.vapi.removeAllListeners()
  }

  isMuted(): boolean {
    if (!this.vapi) return false
    return this.vapi.isMuted()
  }

  setMuted(muted: boolean): void {
    if (!this.vapi) return
    this.vapi.setMuted(muted)
  }
}

// Singleton instance
export const vapiManager = new VapiManager()