import { createRouter } from '../../core/create-app'
import {
    generateReferralCodeHandler,
    generateReferralCodeRoute,
} from './routes/generate-referral-code'
import {
    getReferralCodeHandler,
    getReferralCodeRoute,
} from './routes/get-referral-code'
import {
    getReferralPointsHandler,
    getReferralPointsRoute,
} from './routes/get-referral-points'
import {
    getReferredUsersHandler,
    getReferredUsersRoute,
} from './routes/get-referred-users-by-ref-code'

export const referralCodeV1Routes = createRouter()
    .openapi(generateReferralCodeRoute, generateReferralCodeHandler)
    .openapi(getReferralCodeRoute, getReferralCodeHandler)
    .openapi(getReferredUsersRoute, getReferredUsersHandler)
    .openapi(getReferralPointsRoute, getReferralPointsHandler)
