# 🧘 Monk Mode AI — Open-Source Core (context.md)

> **Declaración de Valor:**
> *"Ayudamos a estudiantes, desarrolladores y profesionales remotos a maximizar su enfoque cognitivo y automatizar la gestión de su tiempo sin depender de la fuerza de voluntad."*

---

## 📌 1. Visión General del Proyecto

**Monk Mode AI** es un agente autónomo de productividad a nivel de sistema operativo (OS) construido bajo el modelo **Commercial Open Source Software (COSS) / Open-Core**. 

Su propósito principal es operar en segundo plano resguardando la atención profunda (*Deep Work*) mediante la clasificación del contexto en pantalla por IA con latencia sub-500ms, emitiendo alertas contra distracciones y generando automáticamente borradores detallados de tiempo trabajados sin fricción manual.

---

## 💡 2. Formato y Tipo de Aplicación

La versión **Open-Source (Core)** está diseñada bajo el patrón de experiencia de usuario **System Tray-Only App**:

* **Ubicación:** Corre como un daemon de fondo y vive exclusivamente en la bandeja del sistema (al lado del reloj en Windows/Linux o en la barra de menús superior en macOS).
* **Sin barra de tareas:** No aparece con ventana persistente ni icono en la barra de tareas (`skipTaskbar: true`), garantizando **cero distracción visual** y un acceso instantáneo al hacer clic sobre el logo.
* **Consumo ultra bajo:** Diseñada para mantener un consumo de memoria RAM de entre 30MB y 50MB y un uso de CPU < 1%.

---

## 🧪 3. Hipótesis Clave a Validar con el MVP

El lanzamiento de la versión Open-Source busca poner a prueba **5 hipótesis críticas**:

### 🛠️ Bloque A: Viabilidad Técnica y Funcionamiento
* **H1 (Privacidad en Monitoreo OS):** Los desarrolladores permiten que un ejecutable lea los títulos de sus ventanas en segundo plano siempre que el código sea 100% Open-Source, auditable y la telemetría permanezca local.
* **H2 (Baja Latencia & UX):** La intervención por IA es percibida como útil y no invasiva siempre que ocurra en **menos de 500ms** a través de notificaciones nativas del OS.
* **H3 (Precisión del Contexto Ligero):** Un modelo de IA liviano (o prompts estructurados en un LLM) clasifica con precisión si una ventana es "trabajo" o "distracción" leyendo únicamente el título de la ventana y el nombre del proceso, sin procesar capturas de pantalla continuas.

### 📈 Bloque B: Tracción e Interés de Mercado
* **H4 (Atracción Orgánica DevRel):** La propuesta de "proteger el Deep Work sin fuerza de voluntad" genera más de **100 estrellas (stars) en GitHub** durante los primeros 7 días tras ser publicada en comunidades técnicas (Reddit, Hacker News, Dev.to).
* **H5 (Conversión a Cloud):** Más del **10% de los usuarios activos** del ejecutable Open-Source hacen clic en la lista de espera para migrar a la versión administrada (*Monk Mode Cloud*) y evitar gestionar sus propias API Keys.

---

## 🛠️ 4. Stack Tecnológico del Core Open-Source

El stack técnico está seleccionado para maximizar la velocidad de prototipado sin comprometer el rendimiento:

┌────────────────────────────────────────────────────────┐
│             UI / System Tray (Tauri v2)                │
│             • Frontend: React + Tailwind CSS           │
│             • Backend Window: Rust (System Tray)       │
└───────────────────────────┬────────────────────────────┘
│
┌───────────────────────────▼────────────────────────────┐
│                  Core Engine (Daemon)                  │
│   • OS Capture Loop: Python / Rust (win32gui / Quartz) │
│   • Local Storage: SQLite / JSON (~/.monkmode/logs/)   │
│   • OS Alerter: Native Notifications API               │
└───────────────────────────┬────────────────────────────┘
│
┌───────────────────────────▼────────────────────────────┐
│                   Inference Engine                     │
│  • Mode A (Local): Ollama (Qwen-2.5-Coder / Llama-3.2) │
│  • Mode B (Fast Cloud): Groq / OpenAI API (User Key)   │
└────────────────────────────────────────────────────────┘


* **Frontend & System Tray:** Tauri (Rust + React) — *Binarios ultra ligeros, skipTaskbar activado.*
* **OS Telemetry & Logic:** Python (MVP inicial) / Rust (Core final)
  * *Windows:* `pygetwindow`, `win32gui`
  * *macOS:* `pyobjc` (Quartz)
  * *Linux:* `xdotool` / `python-xlib`
* **Inferencia por IA:** Ollama local / API de Groq o OpenAI (mediante `.env` o config file).
* **CLI de Control:** `typer` + `rich` en Python para comandos rápidos (`monk start`, `monk status`, `monk log`).

---

## 🚀 5. Bucle de Uso (Core User Loop)

1. **`monk start "Refactorización de API de pagos"`** * El daemon se activa en la bandeja del sistema y comienza el loop de captura (cada 3-5 segundos).
2. **Monitoreo Silencioso:**
   * Si el usuario cambia a `VS Code - auth.py` ➔ *Contexto válido (Deep Work)*.
   * Si cambia a `YouTube - Video de entretenimiento` ➔ *Notificación nativa instantánea: "Monk Mode: ¿Esta ventana coincide con tu tarea activa?"*.
3. **Sincronización & Log de Tiempo:**
   * Al finalizar la sesión (`monk stop`), el motor genera un resumen estructurado `.json` o `.md` listo para adjuntar a Jira, GitHub Issues o ClickUp.

---

## 🏁 6. Criterios de Éxito del MVP (Métricas de Validación)

| Métrica | Meta del MVP |
| :--- | :--- |
| **Tiempo de Latencia de IA** | `< 500ms` por clasificación de contexto. |
| **Consumo de Memoria RAM** | `< 50 MB` en estado de ejecución continua. |
| **Tracción en GitHub** | `> 100 Stars` en la primera semana de lanzamiento público. |
| **Lista de Espera Cloud** | `> 10%` de conversión de descargas a registro en lista Cloud. |

---

## 👤 Información del Creador

* **Proyecto:** Monk Mode AI (COSS)
* **Lead Architect & Founder:** Anthony Bryan Pérez Cuenca
* **Contacto:** `anthony@monkmode.ai`
* **Repositorio:** `github.com/monkmode-ai/monkmode-core`