import { checkBotId } from 'botid/server';
import { NextResponse } from 'next/server';

/**
 * For API routes - returns error response if bot, null if human
 * Usage: const botResponse = await requireHuman(); if (botResponse) return botResponse;
 */
export async function requireHuman(): Promise<NextResponse | null> {
  const verification = await checkBotId();
  if (verification.isBot) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }
  return null;
}

/**
 * For server actions - throws if bot detected
 */
export async function assertHuman() {
  const verification = await checkBotId();
  if (verification.isBot) {
    throw new Error('Access denied - bot detected');
  }
}
