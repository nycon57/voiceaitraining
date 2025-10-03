"use client"

import { useState } from "react"
import { AttemptHistoryTable } from "./attempt-history-table"
import { AttemptDetailModal } from "./attempt-detail-modal"

interface Attempt {
  id: string
  started_at: string
  duration_seconds?: number
  score?: number
  status: 'completed' | 'in_progress' | 'failed'
}

interface AttemptHistoryClientProps {
  attempts: Attempt[]
}

export function AttemptHistoryClient({ attempts }: AttemptHistoryClientProps) {
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleAttemptClick = (attemptId: string) => {
    setSelectedAttemptId(attemptId)
    setModalOpen(true)
  }

  return (
    <>
      <AttemptHistoryTable attempts={attempts} onAttemptClick={handleAttemptClick} />
      <AttemptDetailModal
        attemptId={selectedAttemptId}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  )
}
