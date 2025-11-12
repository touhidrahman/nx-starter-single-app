import { createRouter } from '../../core/create-app'
import {
    changePasswordHandler,
    changePasswordRoute,
} from './routes/change-password'
import {
    checkUserVerificationStatusHandler,
    checkUserVerificationStatusRoute,
} from './routes/check-user-verification-status'
import {
    createProfileHandler,
    createProfileRoute,
} from './routes/create-profile'
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
    sendEmailToInactiveUsersHandler,
    sendEmailToInactiveUsersRoute,
} from './routes/send-email-to-inactive-users'

import {
    setDefaultGroupHandler,
    setDefaultGroupRoute,
} from './routes/set-default-group-to-authUser'
import { getTokenRoute, getTokenRouteHandler } from './routes/token'
import { verifyEmailHandler, verifyEmailRoute } from './routes/verify-email'
import { verifyPinHandler, verifyPinRoute } from './routes/verify-pin'

export const authV1Routes = createRouter()
    .openapi(sendEmailToInactiveUsersRoute, sendEmailToInactiveUsersHandler)
    .openapi(loginRoute, loginHandler)
    .openapi(getTokenRoute, getTokenRouteHandler)
    .openapi(registerRoute, registerHandler)
    .openapi(groupSwitchRoute, groupSwitchHandler)
    .openapi(createProfileRoute, createProfileHandler)
    .openapi(setDefaultGroupRoute, setDefaultGroupHandler)
    .openapi(changePasswordRoute, changePasswordHandler)
    .openapi(forgotPasswordRoute, forgotPasswordHandler)
    .openapi(resetPasswordRoute, resetPasswordHandler)
    .openapi(verifyEmailRoute, verifyEmailHandler)
    .openapi(resendVerificationRoute, resendVerificationHandler)
    .openapi(
        checkUserVerificationStatusRoute,
        checkUserVerificationStatusHandler,
    )
    .openapi(enablePinRoute, enablePinHandler)
    .openapi(verifyPinRoute, verifyPinHandler)
    .openapi(forgotPINCodeRoute, forgotPINCodeHandler)
