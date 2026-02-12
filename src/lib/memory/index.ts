export type { ContentType, StoreEmbeddingParams, SearchSimilarParams, SimilarResult } from './embeddings'
export { generateEmbedding, storeEmbedding, searchSimilar } from './embeddings'

export type { MemoryType, Trend, MemoryEntry, WeaknessEntry, SkillLevel, TrajectoryPoint, UpsertMemoryParams } from './user-memory'
export { upsertMemory, getWeaknessProfile, getSkillLevels, getTopWeaknesses, getTopStrengths } from './user-memory'

export type { DimensionResult } from './weakness-profiler'
export { generateWeaknessProfile } from './weakness-profiler'

export type { AttemptSummary, PracticePattern, AgentContext } from './query'
export { getAgentContext, getRecentAttemptSummaries, getPracticePattern } from './query'
