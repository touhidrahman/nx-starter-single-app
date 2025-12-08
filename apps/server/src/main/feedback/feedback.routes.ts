import { createRouter } from '../../core/create-app'
import { createFeedbackHandler, createFeedbackRoute } from './routes/create-feedback'
import { deleteFeedBackHandler, deleteFeedBackRoute } from './routes/delete-feedback'
import { getFeedbackHandler, getFeedbackRoute } from './routes/get-feedback'
import { getFeedbacksHandler, getFeedbacksRoute } from './routes/get-feedback-list'
import { updateFeedbackHandler, updateFeedbackRoute } from './routes/update-feedback'

export const feedbackV1Routes = createRouter()
    .openapi(getFeedbackRoute, getFeedbackHandler)
    .openapi(updateFeedbackRoute, updateFeedbackHandler)
    .openapi(getFeedbacksRoute, getFeedbacksHandler)
    .openapi(createFeedbackRoute, createFeedbackHandler)
    .openapi(deleteFeedBackRoute, deleteFeedBackHandler)
