'use client'

import { useState } from 'react'
import { WebhookForm } from './webhook-form'

interface WebhookManagerProps {
  webhook?: any
  children: React.ReactNode
}

export function WebhookManager({ webhook, children }: WebhookManagerProps) {
  const [open, setOpen] = useState(false)

  const handleClick = () => {
    setOpen(true)
  }

  const handleSuccess = () => {
    // Refresh the page or update the list
    window.location.reload()
  }

  return (
    <>
      <div onClick={handleClick} className="cursor-pointer">
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