import { createRouter } from '../../core/create-app'
import { listClaimsHandler, listClaimsRoute } from './routes/list-claims'

export const claimV1Routes = createRouter().openapi(
    listClaimsRoute,
    listClaimsHandler,
)
