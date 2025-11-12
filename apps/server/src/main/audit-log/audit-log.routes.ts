import { createRouter } from '../../core/create-app'
import { createLogHandler, createLogRoute } from './routes/create-log'
import { deleteLogHandler, deleteLogRoute } from './routes/delete-log'
import {
    deleteLogByEntityIdHandler,
    deleteLogByEntityIdRoute,
} from './routes/delete-log-by-entityId'
import { getLogHandler, getLogRoute } from './routes/get-log'
import { getLogListHandler, getLogListRoute } from './routes/get-log-list'

export const logsV1Route = createRouter()
    .openapi(getLogListRoute, getLogListHandler)
    .openapi(createLogRoute, createLogHandler)
    .openapi(getLogRoute, getLogHandler)
    .openapi(deleteLogByEntityIdRoute, deleteLogByEntityIdHandler)
    .openapi(deleteLogRoute, deleteLogHandler)
