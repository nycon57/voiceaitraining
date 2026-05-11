'use client'

import { useState } from 'react'
import { WebhookForm } from './webhook-form'

interface WebhookManagerProps {
  webhook?: any
  children: React.ReactNode
}

export function WebhookManager({ webhook, children }: WebhookManagerProps) {
  const [open, setOpen] = useState(false)

  const openWebhookForm = () => {
    setOpen(true)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openWebhookForm()
    }
  }

  const handleSuccess = () => {
    // Refresh the page or update the list
    window.location.reload()
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={openWebhookForm}
        onKeyDown={handleKeyDown}
        className="cursor-pointer"
      >
        {children}
      </div>
      <WebhookForm
        open={open}
        onOpenChange={setOpen}
        webhook={webhook}
        onSuccess={handleSuccess}
      />
    </>
  )
}
