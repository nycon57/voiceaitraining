import { MessageSquare, User, Volume2 } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

import type { TranscriptEntry } from './types';

export interface TranscriptTabProps {
  transcript: TranscriptEntry[];
  agentName?: string;
}

/**
 * TranscriptTab Component
 *
 * Displays the full conversation transcript with:
 * - Speaker identification (user vs AI agent)
 * - Timestamps
 * - Color-coded messages
 * - Scrollable view for long conversations
 *
 * @example
 * ```tsx
 * <TranscriptTab
 *   transcript={parsedTranscript}
 *   agentName={scenario.persona?.profile?.name}
 * />
 * ```
 */
export function TranscriptTab({ transcript, agentName = 'AI Agent' }: TranscriptTabProps) {
  const hasTranscript = transcript && transcript.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-lg">
          Conversation Transcript
        </CardTitle>
        <CardDescription>
          Complete record of your training session
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasTranscript ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transcript.map((entry, index) => (
              <TranscriptMessage
                key={index}
                entry={entry}
                agentName={agentName}
              />
            ))}
          </div>
        ) : (
          <EmptyTranscript />
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Individual transcript message
 */
function TranscriptMessage({
  entry,
  agentName,
}: {
  entry: TranscriptEntry;
  agentName: string;
}) {
  const isUser = entry.role === 'user';

  return (
    <div
      className={cn(
        'p-3 rounded-lg border-l-4',
        isUser
          ? 'bg-info/10 border-info'
          : 'bg-muted/30 border-muted-foreground/30',
      )}
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        {isUser ? (
          <User className="h-3 w-3" />
        ) : (
          <Volume2 className="h-3 w-3" />
        )}
        <span className="font-medium">
          {isUser ? 'You' : agentName}
        </span>
        {entry.timestamp && (
          <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
        )}
      </div>
      <div className="text-sm leading-relaxed">{entry.content}</div>
    </div>
  );
}

/**
 * Empty state when no transcript is available
 */
function EmptyTranscript() {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p>No transcript available</p>
    </div>
  );
}