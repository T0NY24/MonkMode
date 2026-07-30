import 'dotenv/config'

import { getEnvConfig } from './config/env'
import { SesionesModule } from './modules/sesiones/sesiones.module'
import { createApp } from './app'

async function bootstrap() {
  const env = getEnvConfig()
  const sesionesModule = new SesionesModule()
  const app = createApp(sesionesModule)

  await sesionesModule.sesionesService.resumeIfNeeded()

  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Monk backend running on port ${env.port}`)
  })
}

void bootstrap()
