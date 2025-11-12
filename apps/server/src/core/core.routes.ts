import { createRouter } from './create-app'
import { healthRoute, healthRouteHandler } from './get-health'
import { postSeedHandler, postSeedRoute } from './seed/post-seed'

export const coreRoutes = createRouter()
    .openapi(healthRoute, healthRouteHandler)
    .openapi(postSeedRoute, postSeedHandler)
