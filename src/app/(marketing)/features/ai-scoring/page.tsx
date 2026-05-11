import type { Metadata } from 'next'

import PageClient from './page-client'

export const metadata: Metadata = {
  title: 'AI Scoring | SpeakStride',
}

export default function Page() {
  return <PageClient />
}
