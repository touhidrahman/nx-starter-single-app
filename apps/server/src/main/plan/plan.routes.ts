import { createRouter } from '../../core/create-app'
import { createPlanHandler, createPlanRoute } from './routes/create-plan'
import { deletePlanHandler, deletePlanRoute } from './routes/delete-plan'
import { getPlanHandler, getPlanRoute } from './routes/get-plan'
import { getPlansHandler, getPlansRoute } from './routes/get-plans'
import { updatePlanHandler, updatePlanRoute } from './routes/update-plan'

export const planV1Routes = createRouter()
    .openapi(createPlanRoute, createPlanHandler)
    .openapi(getPlansRoute, getPlansHandler)
    .openapi(getPlanRoute, getPlanHandler)
    .openapi(updatePlanRoute, updatePlanHandler)
    .openapi(deletePlanRoute, deletePlanHandler)
