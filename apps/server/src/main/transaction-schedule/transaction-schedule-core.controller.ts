import { createRoute, z } from '@hono/zod-openapi'
import { CREATED, NOT_FOUND, OK } from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../core/core.type'
import { createRouter } from '../../core/create-app'
import { zEmpty, zId, zIds } from '../../models/common.schema'
import { ApiListResponse, ApiResponse } from '../../utils/api-response.util'
import { buildPaginationResponse } from '../../utils/pagination.util'
import {
    zInsertTransactionSchedule,
    zQueryTransactionSchedules,
    zSelectTransactionSchedule,
    zUpdateTransactionSchedule,
} from './transaction-schedule.model'
import { TransactionScheduleCoreService } from './transaction-schedule-core.service'

const tags = ['TransactionSchedule']
const path = '/core/transaction-schedules'
const middleware = undefined

const GetTransactionScheduleListCoreDef = createRoute({
    path,
    tags,
    method: 'get',
    middleware,
    request: {
        query: zQueryTransactionSchedules,
    },
    responses: {
        [OK]: ApiListResponse(
            z.array(zSelectTransactionSchedule),
            'TransactionSchedule List',
        ),
    },
})

const GetTransactionScheduleListCore: AppRouteHandler<
    typeof GetTransactionScheduleListCoreDef
> = async (c) => {
    const query = c.req.valid('query')
    const data = await TransactionScheduleCoreService.findMany(query)
    const count = await TransactionScheduleCoreService.count(query)

    return c.json(
        {
            data,
            pagination: buildPaginationResponse(query.page, query.size, count),
            message: 'TransactionSchedule list fetched successfully',
            success: true,
        },
        OK,
    )
}

const GetTransactionScheduleByIdCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'get',
    middleware,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(
            zSelectTransactionSchedule,
            'TransactionSchedule details',
        ),
        [NOT_FOUND]: ApiResponse(zEmpty, 'TransactionSchedule not found'),
    },
})

const GetTransactionScheduleByIdCore: AppRouteHandler<
    typeof GetTransactionScheduleByIdCoreDef
> = async (c) => {
    const { id } = c.req.valid('param')
    const transactionSchedule =
        await TransactionScheduleCoreService.findById(id)

    if (!transactionSchedule) {
        return c.json(
            {
                data: {},
                message: 'TransactionSchedule not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    return c.json(
        {
            data: transactionSchedule,
            message: 'TransactionSchedule details fetched successfully',
            success: true,
        },
        OK,
    )
}

const CreateTransactionScheduleCoreDef = createRoute({
    path,
    tags,
    method: 'post',
    middleware,
    request: {
        body: jsonContent(
            zInsertTransactionSchedule,
            'TransactionSchedule Create Data',
        ),
    },
    responses: {
        [CREATED]: ApiResponse(
            zSelectTransactionSchedule,
            'TransactionSchedule created successfully',
        ),
    },
})

const CreateTransactionScheduleCore: AppRouteHandler<
    typeof CreateTransactionScheduleCoreDef
> = async (c) => {
    const body = c.req.valid('json')
    const newTransactionSchedule =
        await TransactionScheduleCoreService.create(body)

    return c.json(
        {
            data: newTransactionSchedule,
            message: 'TransactionSchedule created successfully',
            success: true,
        },
        CREATED,
    )
}

const UpdateTransactionScheduleCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'put',
    middleware,
    request: {
        params: zId,
        body: jsonContent(
            zUpdateTransactionSchedule,
            'TransactionSchedule Update Data',
        ),
    },
    responses: {
        [OK]: ApiResponse(
            zSelectTransactionSchedule,
            'TransactionSchedule updated successfully',
        ),
        [NOT_FOUND]: ApiResponse(zEmpty, 'TransactionSchedule not found'),
    },
})

const UpdateTransactionScheduleCore: AppRouteHandler<
    typeof UpdateTransactionScheduleCoreDef
> = async (c) => {
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')
    const existingTransactionSchedule =
        await TransactionScheduleCoreService.findById(id)

    if (!existingTransactionSchedule) {
        return c.json(
            {
                data: {},
                message: 'TransactionSchedule not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    const updatedTransactionSchedule =
        await TransactionScheduleCoreService.update(id, body)

    return c.json(
        {
            data: updatedTransactionSchedule,
            message: 'TransactionSchedule updated successfully',
            success: true,
        },
        OK,
    )
}

const DeleteTransactionScheduleCoreDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'delete',
    middleware,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(
            zSelectTransactionSchedule,
            'TransactionSchedule deleted successfully',
        ),
        [NOT_FOUND]: ApiResponse(zEmpty, 'TransactionSchedule not found'),
    },
})

const DeleteTransactionScheduleCore: AppRouteHandler<
    typeof DeleteTransactionScheduleCoreDef
> = async (c) => {
    const { id } = c.req.valid('param')
    const existingTransactionSchedule =
        await TransactionScheduleCoreService.findById(id)

    if (!existingTransactionSchedule) {
        return c.json(
            {
                data: {},
                message: 'TransactionSchedule not found',
                success: false,
            },
            NOT_FOUND,
        )
    }

    await TransactionScheduleCoreService.delete(id)

    return c.json(
        {
            data: existingTransactionSchedule,
            message: 'TransactionSchedule deleted successfully',
            success: true,
        },
        OK,
    )
}

const DeleteManyTransactionScheduleCoreDef = createRoute({
    path,
    tags,
    method: 'delete',
    middleware,
    request: {
        body: jsonContent(zIds, 'TransactionSchedule IDs to delete'),
    },
    responses: {
        [OK]: ApiResponse(zEmpty, 'TransactionSchedules deleted successfully'),
    },
})

const DeleteManyTransactionScheduleCore: AppRouteHandler<
    typeof DeleteManyTransactionScheduleCoreDef
> = async (c) => {
    const { ids } = c.req.valid('json')

    await TransactionScheduleCoreService.deleteMany(ids)

    return c.json(
        {
            data: {},
            message: 'TransactionSchedules deleted successfully',
            success: true,
        },
        OK,
    )
}

export const transactionScheduleCoreRoutes = createRouter()
    .openapi(DeleteTransactionScheduleCoreDef, DeleteTransactionScheduleCore)
    .openapi(UpdateTransactionScheduleCoreDef, UpdateTransactionScheduleCore)
    .openapi(GetTransactionScheduleByIdCoreDef, GetTransactionScheduleByIdCore)
    .openapi(
        DeleteManyTransactionScheduleCoreDef,
        DeleteManyTransactionScheduleCore,
    )
    .openapi(CreateTransactionScheduleCoreDef, CreateTransactionScheduleCore)
    .openapi(GetTransactionScheduleListCoreDef, GetTransactionScheduleListCore)
