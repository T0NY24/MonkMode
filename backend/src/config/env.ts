export interface EnvConfig {
  port: number
  iaProvider: 'openai' | 'groq' | 'ollama' | 'none'
  iaApiKey?: string
  iaBaseUrl?: string
  iaModel: string
  telemetryMinSeconds: number
  telemetryMaxSeconds: number
}

function toNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value)
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed
  }

  return fallback
}

export function getEnvConfig(): EnvConfig {
  const provider = (process.env.IA_PROVIDER || 'none').toLowerCase()
  const iaProvider: EnvConfig['iaProvider'] =
    provider === 'openai' || provider === 'groq' || provider === 'ollama'
      ? provider
      : 'none'

  const defaultBaseUrl =
    iaProvider === 'openai'
      ? 'https://api.openai.com/v1/chat/completions'
      : iaProvider === 'groq'
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : iaProvider === 'ollama'
      ? 'http://localhost:11434/api/generate'
      : undefined

  return {
    port: toNumber(process.env.PORT, 4020),
    iaProvider,
    iaApiKey: process.env.IA_API_KEY,
    iaBaseUrl: process.env.IA_BASE_URL || defaultBaseUrl,
    iaModel: process.env.IA_MODEL || 'llama-3.1-8b-instant',
    telemetryMinSeconds: toNumber(process.env.TELEMETRY_MIN_SECONDS, 3),
    telemetryMaxSeconds: toNumber(process.env.TELEMETRY_MAX_SECONDS, 5)
  }
}
