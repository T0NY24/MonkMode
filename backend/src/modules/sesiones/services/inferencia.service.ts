import { getEnvConfig } from '../../../config/env'
import { ClassificationResult } from '../../../shared/types'

interface ChatCompletionChoice {
  message?: {
    content?: string
  }
}

interface ChatCompletionResponse {
  choices?: ChatCompletionChoice[]
}

export class InferenciaService {
  private readonly env = getEnvConfig()

  async classify(
    taskDescription: string,
    windowTitle: string,
    processName: string
  ): Promise<ClassificationResult | null> {
    if (this.env.iaProvider === 'none' || !this.env.iaBaseUrl) {
      return null
    }

    const prompt = [
      'Eres un clasificador de foco de trabajo.',
      `Tarea actual: ${taskDescription}`,
      `Título de ventana: ${windowTitle || '(vacío)'}`,
      `Proceso: ${processName || '(vacío)'}`,
      'Responde exclusivamente JSON válido con este formato exacto:',
      '{"is_distraction": boolean, "reason": string}'
    ].join('\n')

    try {
      if (this.env.iaProvider === 'ollama') {
        return this.classifyWithOllama(prompt)
      }

      return this.classifyWithOpenAiCompatible(prompt)
    } catch {
      return null
    }
  }

  private async classifyWithOpenAiCompatible(
    prompt: string
  ): Promise<ClassificationResult | null> {
    if (!this.env.iaApiKey) {
      return null
    }

    const response = await fetch(this.env.iaBaseUrl as string, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.env.iaApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.env.iaModel,
        temperature: 0,
        messages: [
          {
            role: 'system',
            content:
              'Responde únicamente JSON sin markdown ni texto adicional.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    })

    if (!response.ok) {
      return null
    }

    const payload = (await response.json()) as ChatCompletionResponse
    const raw = payload.choices?.[0]?.message?.content
    return this.tryParseClassification(raw)
  }

  private async classifyWithOllama(
    prompt: string
  ): Promise<ClassificationResult | null> {
    const response = await fetch(this.env.iaBaseUrl as string, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.env.iaModel,
        prompt,
        format: 'json',
        stream: false
      })
    })

    if (!response.ok) {
      return null
    }

    const payload = (await response.json()) as { response?: string }
    return this.tryParseClassification(payload.response)
  }

  private tryParseClassification(
    rawContent: string | undefined
  ): ClassificationResult | null {
    if (!rawContent) {
      return null
    }

    try {
      const parsed = JSON.parse(rawContent) as {
        is_distraction?: unknown
        reason?: unknown
      }

      if (
        typeof parsed.is_distraction !== 'boolean' ||
        typeof parsed.reason !== 'string'
      ) {
        return null
      }

      return {
        is_distraction: parsed.is_distraction,
        reason: parsed.reason
      }
    } catch {
      return null
    }
  }
}
