import type { Metadata } from 'next'

import { getScenario } from '@/actions/scenarios'
import PageClient from './page-client'

export const metadata: Metadata = {
  title: 'Live Call | SpeakStride',
}

interface PageProps {
  params: Promise<{ scenarioId: string }>
}

export default async function Page({ params }: PageProps) {
  const { scenarioId } = await params
  const scenario = await getScenario(scenarioId).catch(() => null)

  return <PageClient scenario={scenario} scenarioId={scenarioId} />
}
