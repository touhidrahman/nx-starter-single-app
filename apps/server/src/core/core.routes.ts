import { postSeedHandler, postSeedRoute } from '../seed/post-seed'
import { createRouter } from './create-app'
import { healthRoute, healthRouteHandler } from './get-health'

export const coreRoutes = createRouter()
    .openapi(healthRoute, healthRouteHandler)
    .openapi(postSeedRoute, postSeedHandler)
