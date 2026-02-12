export type {
  CopilotAudioChunk,
  CopilotSession,
  CopilotSessionStatus,
  ClientControlMessage,
  ConnectedMessage,
  ErrorMessage,
  AckMessage,
  ServerMessage,
} from './types'

export {
  AUDIO_SAMPLE_RATE,
  AUDIO_CHANNELS,
  AUDIO_BIT_DEPTH,
  WS_CLOSE_CODES,
  clientControlSchema,
} from './types'

export {
  createSession,
  getSession,
  updateSessionActivity,
  setSessionStatus,
  removeSession,
  getActiveSessionCount,
  getSessionsByUser,
  getSessionsByOrg,
} from './session-manager'

export { handleCopilotConnection } from './ws-handler'
