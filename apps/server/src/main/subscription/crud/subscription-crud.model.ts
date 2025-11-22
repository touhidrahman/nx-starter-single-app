import { z } from 'zod'
import { zSelectPlan } from '../../plan/core/plan-core.model'
import { zSelectSubscription } from '../core/subscription-core.model'

export type SubscriptionWithPlan = z.infer<typeof zSubscriptionWithPlan>

export const zSubscriptionWithPlan = zSelectSubscription.extend({
    plan: zSelectPlan.nullable(),
})
