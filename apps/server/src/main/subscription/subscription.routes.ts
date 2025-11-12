import { createRouter } from '../../core/create-app'
import {
    approveSubscriptionRequestHandler,
    approveSubscriptionRequestRoute,
} from './routes/approve-subscription-request'
import {
    createSubscriptionsHandler,
    createSubscriptionsRoute,
} from './routes/create-subscription'
import {
    createSubscriptionsRequestHandler,
    createSubscriptionsRequestRoute,
} from './routes/create-subscriptions-request'
import {
    deleteAllSubscriptionHandler,
    deleteAllSubscriptionRoute,
} from './routes/delete-all-subscription'
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
} from './routes/get-subscription-groupId'
import {
    getSubscriptionListHandler,
    getSubscriptionListRoute,
} from './routes/get-subscription-list'
import {
    getSubscriptionListByGroupIdHandler,
    getSubscriptionListByGroupIdRoute,
} from './routes/get-subscription-list-groupId'
import {
    getSubscriptionRequestListHandler,
    getSubscriptionRequestListRoute,
} from './routes/get-subscription-request-list'
import {
    updateSubscriptionHandler,
    updateSubscriptionRoute,
} from './routes/update-subscription'

export const subscriptionV1Route = createRouter()
    .openapi(createSubscriptionsRoute, createSubscriptionsHandler)
    .openapi(createSubscriptionsRequestRoute, createSubscriptionsRequestHandler)
    .openapi(getSubscriptionRequestListRoute, getSubscriptionRequestListHandler)
    .openapi(getSubscriptionRoute, getSubscriptionHandler)
    .openapi(getSubscriptionByGroupIdRoute, getSubscriptionByGroupIdHandler)
    .openapi(
        getSubscriptionListByGroupIdRoute,
        getSubscriptionListByGroupIdHandler,
    )
    .openapi(getSubscriptionListRoute, getSubscriptionListHandler)
    .openapi(approveSubscriptionRequestRoute, approveSubscriptionRequestHandler)
    .openapi(updateSubscriptionRoute, updateSubscriptionHandler)
    .openapi(deleteSubscriptionRoute, deleteSubscriptionHandler)
    .openapi(deleteAllSubscriptionRoute, deleteAllSubscriptionHandler)
