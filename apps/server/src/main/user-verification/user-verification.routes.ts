import { createRouter } from '../../core/create-app'
import {
    userVerificationHandler,
    userVerificationRoute,
} from './routes/verify-user'

export const userVerificationV1Routes = createRouter().openapi(
    userVerificationRoute,
    userVerificationHandler,
)
