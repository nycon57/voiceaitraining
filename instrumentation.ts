export async function register() {
  const { assertInngestEnv } = await import('@/lib/inngest/client')
  assertInngestEnv()
}
