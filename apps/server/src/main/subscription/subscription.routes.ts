import { createRouter } from '../../core/create-app'
import {
    approveSubscriptionRequestHandler,
    approveSubscriptionRoute,
} from './routes/approve-subscription-request'
import {
    createSubscriptionsHandler,
    createSubscriptionsRoute,
} from './routes/create-subscription'
import {
    deleteAllSubscriptionHandler,
    deleteAllSubscriptionRoute,
} from './routes/delete-many-subscriptions'
import {
    deleteSubscriptionHandler,
    deleteSubscriptionRoute,
} from './routes/delete-subscription'
import {
    getSubscriptionHandler,
    getSubscriptionRoute,
} from './routes/get-subscription'
import {
    getSubscriptionByGroupIdHandler,
    getSubscriptionByGroupIdRoute,
} from './routes/get-subscription-by-group'
import {
    getSubscriptionListHandler,
    getSubscriptionListRoute,
} from './routes/get-subscription-list'
import {
    updateSubscriptionHandler,
    updateSubscriptionRoute,
} from './routes/update-subscription'

export const subscriptionV1Route = createRouter()
    .openapi(createSubscriptionsRoute, createSubscriptionsHandler)
    .openapi(getSubscriptionRoute, getSubscriptionHandler)
    .openapi(getSubscriptionByGroupIdRoute, getSubscriptionByGroupIdHandler)
    .openapi(getSubscriptionListRoute, getSubscriptionListHandler)
    .openapi(approveSubscriptionRoute, approveSubscriptionRequestHandler)
    .openapi(updateSubscriptionRoute, updateSubscriptionHandler)
    .openapi(deleteSubscriptionRoute, deleteSubscriptionHandler)
    .openapi(deleteAllSubscriptionRoute, deleteAllSubscriptionHandler)
