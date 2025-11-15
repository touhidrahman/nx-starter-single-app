import { createRouter } from '../core/create-app'
import { acceptInviteHandler, acceptInviteRoute } from './routes/accept-invite'
import {
    changePasswordHandler,
    changePasswordRoute,
} from './routes/change-password'
import { enablePinHandler, enablePinRoute } from './routes/enable-pin'
import {
    forgotPasswordHandler,
    forgotPasswordRoute,
} from './routes/forgot-password'
import { forgotPINCodeHandler, forgotPINCodeRoute } from './routes/forgot-pin'
import { groupSwitchHandler, groupSwitchRoute } from './routes/group-switch'
import { loginHandler, loginRoute } from './routes/login'
import { registerHandler, registerRoute } from './routes/register'
import {
    resendVerificationHandler,
    resendVerificationRoute,
} from './routes/resend-verification'
import {
    resetPasswordHandler,
    resetPasswordRoute,
} from './routes/reset-password'
import {
    setDefaultGroupHandler,
    setDefaultGroupRoute,
} from './routes/set-default-group-to-user'
import { getTokenRoute, getTokenRouteHandler } from './routes/token'
import { verifyEmailHandler, verifyEmailRoute } from './routes/verify-email'
import { verifyPinHandler, verifyPinRoute } from './routes/verify-pin'

export const authV1Routes = createRouter()
    .openapi(loginRoute, loginHandler)
    .openapi(getTokenRoute, getTokenRouteHandler)
    .openapi(registerRoute, registerHandler)
    .openapi(groupSwitchRoute, groupSwitchHandler)
    .openapi(setDefaultGroupRoute, setDefaultGroupHandler)
    .openapi(changePasswordRoute, changePasswordHandler)
    .openapi(forgotPasswordRoute, forgotPasswordHandler)
    .openapi(resetPasswordRoute, resetPasswordHandler)
    .openapi(verifyEmailRoute, verifyEmailHandler)
    .openapi(resendVerificationRoute, resendVerificationHandler)
    .openapi(enablePinRoute, enablePinHandler)
    .openapi(verifyPinRoute, verifyPinHandler)
    .openapi(forgotPINCodeRoute, forgotPINCodeHandler)
    .openapi(acceptInviteRoute, acceptInviteHandler)
