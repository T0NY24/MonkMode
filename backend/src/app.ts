import cors from 'cors'
import express from 'express'

import { SesionesModule } from './modules/sesiones/sesiones.module'
import { errorMiddleware } from './shared/middlewares/error.middleware'

export function createApp(sesionesModule: SesionesModule) {
  const app = express()

  app.use(cors())
  app.use(express.json())
  app.use('/api', sesionesModule.router)
  app.use(errorMiddleware)

  return app
}
