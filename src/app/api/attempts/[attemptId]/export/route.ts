/**
 * API Route: Export Attempt as PDF
 *
 * Generates a branded PDF report for a training attempt
 * Supports both transcript-only and full report exports
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { jsPDF } from 'jspdf'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params
    const searchParams = request.nextUrl.searchParams
    const exportType = searchParams.get('type') || 'full' // 'transcript' or 'full'

    const user = await getCurrentUser()
    if (!user || !user.orgId) {
      return new Response('Unauthorized', { status: 401 })
    }

    const supabase = await createAdminClient()

    // Get attempt with scenario details
    const { data: attempt, error } = await supabase
      .from('scenario_attempts')
      .select(`
        *,
        scenarios (
          title,
          description,
          difficulty,
          persona
        )
      `)
      .eq('id', attemptId)
      .eq('org_id', user.orgId)
      .single()

    if (error || !attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
    }

    // Generate PDF
    const pdf = exportType === 'transcript'
      ? generateTranscriptPDF(attempt, user)
      : generateFullReportPDF(attempt, user)

    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="speakstride-${exportType}-${attemptId}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating export:', error)
    return NextResponse.json(
      { error: 'Failed to generate export' },
      { status: 500 }
    )
  }
}

/**
 * Generate branded PDF for transcript export
 */
function generateTranscriptPDF(attempt: any, user: any): jsPDF {
  const doc = new jsPDF()
  const scenario = attempt.scenarios
  const transcript = Array.isArray(attempt.transcript_json)
    ? attempt.transcript_json
    : []
  const personaName = scenario?.persona?.profile?.name || scenario?.persona?.name || 'Agent'

  const primaryGreen = [16, 185, 129]
  let yPos = 20

  // Header
  doc.setFontSize(24)
  doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2])
  doc.setFont('helvetica', 'bold')
  doc.text('SpeakStride', 20, yPos)

  yPos += 8
  doc.setFontSize(10)
  doc.setTextColor(107, 114, 128)
  doc.setFont('helvetica', 'normal')
  doc.text('AI-Powered Sales Training Platform', 20, yPos)

  // Draw header line
  yPos += 5
  doc.setDrawColor(primaryGreen[0], primaryGreen[1], primaryGreen[2])
  doc.setLineWidth(1)
  doc.line(20, yPos, 190, yPos)

  yPos += 15

  // Metadata box
  doc.setFillColor(249, 250, 251)
  doc.rect(20, yPos, 170, 25, 'F')

  doc.setFontSize(9)
  doc.setTextColor(107, 114, 128)
  doc.setFont('helvetica', 'bold')
  doc.text('SCENARIO', 25, yPos + 6)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(26, 26, 26)
  doc.text(scenario?.title || 'Unknown', 25, yPos + 12)

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(107, 114, 128)
  doc.text('TRAINEE', 85, yPos + 6)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(26, 26, 26)
  doc.text(user.email, 85, yPos + 12)

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(107, 114, 128)
  doc.text('DATE', 145, yPos + 6)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(26, 26, 26)
  doc.text(new Date(attempt.created_at).toLocaleDateString(), 145, yPos + 12)

  yPos += 35

  // Title
  doc.setFontSize(16)
  doc.setTextColor(26, 26, 26)
  doc.setFont('helvetica', 'bold')
  doc.text('Call Transcript', 20, yPos)

  yPos += 10

  // Transcript messages
  doc.setFontSize(9)

  transcript.forEach((msg: any) => {
    const isUser = msg.role === 'user'
    const speaker = isUser ? 'You' : personaName
    const timestamp = formatTime(msg.timestamp || 0)
    const text = msg.text || ''

    // Check if we need a new page
    if (yPos > 270) {
      doc.addPage()
      yPos = 20
    }

    // Speaker and timestamp
    doc.setFont('helvetica', 'bold')
    if (isUser) {
      doc.setTextColor(59, 130, 246)
    } else {
      doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2])
    }
    doc.text(`${speaker} (${timestamp})`, 20, yPos)

    yPos += 5

    // Message text
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(26, 26, 26)
    const splitText = doc.splitTextToSize(text, 170)
    doc.text(splitText, 20, yPos)

    yPos += splitText.length * 5 + 8
  })

  // Footer
  if (yPos > 260) {
    doc.addPage()
    yPos = 20
  }

  yPos = 280
  doc.setDrawColor(229, 231, 235)
  doc.setLineWidth(0.5)
  doc.line(20, yPos, 190, yPos)

  yPos += 8
  doc.setFontSize(9)
  doc.setTextColor(107, 114, 128)
  doc.setFont('helvetica', 'bold')
  const footerText = 'SpeakStride - Transforming sales teams through AI-powered voice training'
  doc.text(footerText, 105, yPos, { align: 'center' })

  yPos += 5
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated on ${new Date().toLocaleString()}`, 105, yPos, { align: 'center' })

  return doc
}

/**
 * Generate branded PDF for full report export
 */
function generateFullReportPDF(attempt: any, user: any): jsPDF {
  const doc = new jsPDF()
  const scenario = attempt.scenarios
  const score = attempt.score || 0
  const scoreBreakdown = Array.isArray(attempt.score_breakdown) ? attempt.score_breakdown : []

  const primaryGreen = [16, 185, 129]
  let yPos = 30

  // Header
  doc.setFontSize(28)
  doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2])
  doc.setFont('helvetica', 'bold')
  doc.text('SpeakStride', 105, yPos, { align: 'center' })

  yPos += 10
  doc.setFontSize(16)
  doc.setTextColor(26, 26, 26)
  doc.text('Performance Report', 105, yPos, { align: 'center' })

  // Draw header line
  yPos += 8
  doc.setDrawColor(primaryGreen[0], primaryGreen[1], primaryGreen[2])
  doc.setLineWidth(1)
  doc.line(20, yPos, 190, yPos)

  yPos += 20

  // Score hero box
  doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2])
  doc.roundedRect(40, yPos, 130, 40, 3, 3, 'F')

  doc.setFontSize(48)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text(`${score}/100`, 105, yPos + 25, { align: 'center' })

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Overall Performance Score', 105, yPos + 35, { align: 'center' })

  yPos += 55

  // Training Details
  doc.setFontSize(14)
  doc.setTextColor(26, 26, 26)
  doc.setFont('helvetica', 'bold')
  doc.text('Training Details', 20, yPos)

  yPos += 10

  // Grid layout for details
  const details = [
    { label: 'SCENARIO', value: scenario?.title || 'Unknown' },
    { label: 'DIFFICULTY', value: scenario?.difficulty || 'Medium' },
    {
      label: 'DURATION',
      value: `${Math.floor((attempt.duration_seconds || 0) / 60)}:${String((attempt.duration_seconds || 0) % 60).padStart(2, '0')}`
    },
    {
      label: 'COMPLETED',
      value: new Date(attempt.ended_at || attempt.created_at).toLocaleDateString()
    }
  ]

  details.forEach((detail, index) => {
    const col = index % 2
    const row = Math.floor(index / 2)
    const x = 20 + (col * 90)
    const y = yPos + (row * 25)

    // Background box
    doc.setFillColor(249, 250, 251)
    doc.roundedRect(x, y, 85, 20, 2, 2, 'F')

    // Label
    doc.setFontSize(8)
    doc.setTextColor(107, 114, 128)
    doc.setFont('helvetica', 'bold')
    doc.text(detail.label, x + 5, y + 7)

    // Value
    doc.setFontSize(10)
    doc.setTextColor(26, 26, 26)
    doc.setFont('helvetica', 'bold')
    const valueText = doc.splitTextToSize(detail.value, 75)
    doc.text(valueText, x + 5, y + 14)
  })

  yPos += 65

  // Performance Breakdown
  if (scoreBreakdown.length > 0) {
    doc.setFontSize(14)
    doc.setTextColor(26, 26, 26)
    doc.setFont('helvetica', 'bold')
    doc.text('Performance Breakdown', 20, yPos)

    yPos += 10

    scoreBreakdown.forEach((item: any) => {
      // Check if we need a new page
      if (yPos > 260) {
        doc.addPage()
        yPos = 20
      }

      // Background box
      doc.setFillColor(249, 250, 251)
      doc.roundedRect(20, yPos, 170, 18, 2, 2, 'F')

      // Left accent
      doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2])
      doc.rect(20, yPos, 2, 18, 'F')

      // Criterion name
      doc.setFontSize(10)
      doc.setTextColor(26, 26, 26)
      doc.setFont('helvetica', 'bold')
      doc.text(item.category || item.criterion_name || 'Unknown', 25, yPos + 7)

      // Score
      doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2])
      const scoreText = `${item.score || 0}/${item.maxScore || item.max_score || 100}`
      doc.text(scoreText, 185, yPos + 7, { align: 'right' })

      // Progress bar
      const barY = yPos + 12
      const barWidth = 165
      const fillWidth = (barWidth * (item.percentage || 0)) / 100

      // Background bar
      doc.setFillColor(229, 231, 235)
      doc.roundedRect(25, barY, barWidth, 4, 2, 2, 'F')

      // Fill bar
      if (fillWidth > 0) {
        doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2])
        doc.roundedRect(25, barY, fillWidth, 4, 2, 2, 'F')
      }

      yPos += 23
    })
  }

  // Footer
  doc.setDrawColor(229, 231, 235)
  doc.setLineWidth(0.5)
  doc.line(20, 280, 190, 280)

  doc.setFontSize(9)
  doc.setTextColor(107, 114, 128)
  doc.setFont('helvetica', 'bold')
  doc.text('SpeakStride - Transforming sales teams through AI-powered voice training', 105, 287, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.text(`Report generated on ${new Date().toLocaleString()}`, 105, 292, { align: 'center' })

  return doc
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
