# MonkMode

## Requisitos

- Node.js 20+
- Rust (para Tauri)
- Visual Studio Build Tools en Windows (toolchain C++)

## Instalación

```bash
npm install
```

## Ejecutar backend + frontend

```bash
npm run dev
```

- Backend: `http://localhost:4020`
- Frontend: `http://localhost:1420`

## Ejecutar app Tauri (System Tray)

```bash
npm run dev:tauri
```

## Variables de entorno backend

1. Copia `backend/.env.example` a `backend/.env`.
2. Ajusta proveedor IA:
   - `IA_PROVIDER=openai|groq|ollama|none`
   - `IA_API_KEY=...` (si aplica)
   - `IA_BASE_URL=...` (opcional)
   - `IA_MODEL=...`