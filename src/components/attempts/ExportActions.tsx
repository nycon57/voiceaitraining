"use client"

import { useState } from 'react'
import { Download, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

interface ExportActionsProps {
  attemptId: string
  scenarioTitle: string
  score: number
}

export function ExportActions({ attemptId }: ExportActionsProps) {
  const [isDownloadingTranscript, setIsDownloadingTranscript] = useState(false)
  const [isDownloadingReport, setIsDownloadingReport] = useState(false)
  const { toast } = useToast()

  const handleDownloadTranscript = async () => {
    setIsDownloadingTranscript(true)
    try {
      const response = await fetch(`/api/attempts/${attemptId}/export?type=transcript`)
      if (!response.ok) throw new Error('Download failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transcript-${attemptId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'Download complete',
        description: 'Your transcript has been downloaded',
      })
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Could not download transcript. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsDownloadingTranscript(false)
    }
  }

  const handleDownloadReport = async () => {
    setIsDownloadingReport(true)
    try {
      const response = await fetch(`/api/attempts/${attemptId}/export?type=full`)
      if (!response.ok) throw new Error('Download failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `training-report-${attemptId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'Download complete',
        description: 'Your full report has been downloaded',
      })
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Could not download report. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsDownloadingReport(false)
    }
  }

  return (
    <Card className="border-primary/20">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Download className="h-4 w-4 text-primary" />
            Export Reports
          </h3>
          <Button
            variant="outline"
            className="w-full border-primary/30 hover:bg-primary/5"
            onClick={handleDownloadTranscript}
            disabled={isDownloadingTranscript || isDownloadingReport}
          >
            {isDownloadingTranscript ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Download Transcript (PDF)
          </Button>
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleDownloadReport}
            disabled={isDownloadingTranscript || isDownloadingReport}
          >
            {isDownloadingReport ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download Full Report (PDF)
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
