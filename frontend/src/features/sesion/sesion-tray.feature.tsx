import { useEffect, useMemo, useState } from 'react'
import {
  isPermissionGranted,
  requestPermission,
  sendNotification
} from '@tauri-apps/plugin-notification'

import { acknowledgeAlert, getSessionStatus, startSession } from './sesion-api'

const DURATION_OPTIONS = [15, 25, 45]

function formatRemaining(endTime: string): string {
  const remainingMs = Math.max(
    new Date(endTime).getTime() - new Date().getTime(),
    0
  )
  const totalSeconds = Math.floor(remainingMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
    2,
    '0'
  )}`
}

async function showNativeNotification(message: string): Promise<void> {
  try {
    let permissionGranted = await isPermissionGranted()
    if (!permissionGranted) {
      const permission = await requestPermission()
      permissionGranted = permission === 'granted'
    }

    if (permissionGranted) {
      sendNotification(message)
      return
    }
  } catch {
    // Fallback a Notification API cuando no corre dentro de Tauri.
  }

  if ('Notification' in window) {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      // eslint-disable-next-line no-new
      new Notification(message)
    }
  }
}

export const SesionTrayFeature = () => {
  const [taskDescription, setTaskDescription] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(25)
  const [endTime, setEndTime] = useState<string | null>(null)
  const [status, setStatus] = useState<'IDLE' | 'LOCKED' | 'COMPLETED'>('IDLE')
  const [mensaje, setMensaje] = useState('Sin sesión activa')
  const [starting, setStarting] = useState(false)
  const [lastAlertId, setLastAlertId] = useState<string | null>(null)

  useEffect(() => {
    const syncStatus = async () => {
      try {
        const current = await getSessionStatus()
        if (!current) {
          setStatus('IDLE')
          setEndTime(null)
          return
        }

        setStatus(current.status)
        setEndTime(current.end_time)
        if (current.status === 'LOCKED') {
          setMensaje(`Monk Mode activo: ${current.task_description}`)
        }

        if (current.status === 'COMPLETED') {
          setMensaje('Sesión completada')
        }

        if (
          current.pending_alert &&
          current.pending_alert.id &&
          current.pending_alert.id !== lastAlertId
        ) {
          await showNativeNotification(
            `Monk Mode: distracción detectada (${current.pending_alert.reason})`
          )
          setLastAlertId(current.pending_alert.id)
          await acknowledgeAlert()
        }
      } catch {
        setMensaje('No se pudo sincronizar con backend')
      }
    }

    void syncStatus()
    const interval = setInterval(() => {
      void syncStatus()
    }, 1000)

    return () => clearInterval(interval)
  }, [lastAlertId])

  const remaining = useMemo(() => {
    if (!endTime || status !== 'LOCKED') {
      return '00:00'
    }

    return formatRemaining(endTime)
  }, [endTime, status])

  const onStart = async () => {
    if (starting || status === 'LOCKED') {
      return
    }

    setStarting(true)
    try {
      const created = await startSession({
        task_description: taskDescription,
        duration_minutes: durationMinutes
      })
      setStatus(created.status)
      setEndTime(created.end_time)
      setMensaje('Monk Mode iniciado y bloqueado')
    } catch {
      setMensaje('No se pudo iniciar la sesión')
    } finally {
      setStarting(false)
    }
  }

  return (
    <main>
      <h1>Monk Mode AI</h1>
      <p>{mensaje}</p>

      {status === 'LOCKED' ? (
        <section>
          <p>Tiempo restante: {remaining}</p>
          <p>Sesión bloqueada (sin pausa ni cancelación)</p>
        </section>
      ) : (
        <section>
          <label htmlFor="task-description">Tarea</label>
          <input
            id="task-description"
            value={taskDescription}
            onChange={(event) => setTaskDescription(event.target.value)}
            placeholder="Describe tu tarea de Deep Work"
          />

          <label htmlFor="duration">Duración</label>
          <select
            id="duration"
            value={durationMinutes}
            onChange={(event) => setDurationMinutes(Number(event.target.value))}
          >
            {DURATION_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option} min
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onStart}
            disabled={starting || taskDescription.trim().length < 3}
          >
            🔒 Iniciar Monk Mode
          </button>
        </section>
      )}
    </main>
  )
}
