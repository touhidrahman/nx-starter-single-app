import { createRoute, z } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'
import { ContentfulStatusCode } from 'hono/utils/http-status'
import {
    FORBIDDEN,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND,
    OK,
} from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../core/core.type'
import { createRouter } from '../../core/create-app'
import { checkPermission } from '../../middlewares/check-permission.middleware'
import { checkToken } from '../../middlewares/check-token.middleware'
import { zId } from '../../models/common.schema'
import { ApiListResponse, ApiResponse } from '../../utils/api-response.util'
import { buildPaginationResponse } from '../../utils/pagination.util'
import { AccessTokenPayload } from '../auth/auth.model'
import {
    zInsertTransactionSchedule,
    zQueryTransactionSchedules,
    zSelectTransactionSchedule,
    zUpdateTransactionSchedule,
} from './transaction-schedule.model'
import { TransactionScheduleService } from './transaction-schedule.service'

const tags = ['TransactionSchedule']
const path = '/transaction-schedules'

const GetTransactionScheduleListDef = createRoute({
    path: path,
    tags,
    method: 'get',
    middleware: [
        checkToken,
        checkPermission(['TransactionSchedule:Read']),
    ] as const,
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

const GetTransactionScheduleList: AppRouteHandler<
    typeof GetTransactionScheduleListDef
> = async (c) => {
    try {
        const query = c.req.valid('query')
        const { groupId } = c.get('jwtPayload') as AccessTokenPayload
        const groupSpecificQuery = { ...query, groupId }
        const data =
            await TransactionScheduleService.findMany(groupSpecificQuery)
        const count = await TransactionScheduleService.count(groupSpecificQuery)

        return c.json(
            {
                data,
                pagination: buildPaginationResponse(
                    query.page,
                    query.size,
                    count,
                ),
                message: 'TransactionSchedule list fetched successfully',
                success: true,
            },
            OK,
        )
    } catch (error) {
        throw new HTTPException(
            error instanceof Error
                ? (error.cause as ContentfulStatusCode)
                : INTERNAL_SERVER_ERROR,
            {
                message:
                    (error as Error).message ??
                    'Failed to fetch TransactionSchedule list',
            },
        )
    }
}

const GetTransactionScheduleDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'get',
    middleware: [
        checkToken,
        checkPermission(['TransactionSchedule:Read']),
    ] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(zSelectTransactionSchedule, 'Item'),
    },
})

const GetTransactionSchedule: AppRouteHandler<
    typeof GetTransactionScheduleDef
> = async (c) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id

    if (!groupId) {
        throw new HTTPException(NOT_FOUND, {
            message: 'TransactionSchedule not found',
        })
    }

    const existing = await TransactionScheduleService.findByIdAndGroupId(
        id,
        groupId,
    )
    if (!existing) {
        throw new HTTPException(NOT_FOUND, {
            message: 'TransactionSchedule not found',
        })
    }

    return c.json(
        {
            data: existing,
            message: 'TransactionSchedule fetched successfully',
            success: true,
        },
        OK,
    )
}

const CreateTransactionScheduleDef = createRoute({
    path,
    tags,
    method: 'post',
    middleware: [
        checkToken,
        checkPermission(['TransactionSchedule:Write']),
    ] as const,
    request: {
        body: jsonContent(zInsertTransactionSchedule, 'Input'),
    },
    responses: {
        [OK]: ApiResponse(zSelectTransactionSchedule, 'Item'),
    },
})

const CreateTransactionSchedule: AppRouteHandler<
    typeof CreateTransactionScheduleDef
> = async (c) => {
    const { groupId, sub: creatorId } = c.get(
        'jwtPayload',
    ) as AccessTokenPayload
    const input = c.req.valid('json')

    if (!groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'TransactionSchedule could not be created',
        })
    }

    try {
        const data = await TransactionScheduleService.create({
            ...input,
            groupId,
            creatorId,
        })

        return c.json(
            {
                data,
                message: 'TransactionSchedule created successfully',
                success: true,
            },
            OK,
        )
    } catch (error) {
        throw new HTTPException(
            error instanceof Error
                ? (error.cause as ContentfulStatusCode)
                : INTERNAL_SERVER_ERROR,
            {
                message:
                    (error as Error).message ??
                    'Failed to create TransactionSchedule',
            },
        )
    }
}

const UpdateTransactionScheduleDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'put',
    middleware: [
        checkToken,
        checkPermission(['TransactionSchedule:Write']),
    ] as const,
    request: {
        params: zId,
        body: jsonContent(zUpdateTransactionSchedule, 'Input'),
    },
    responses: {
        [OK]: ApiResponse(zSelectTransactionSchedule, 'Item'),
    },
})

const UpdateTransactionSchedule: AppRouteHandler<
    typeof UpdateTransactionScheduleDef
> = async (c) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id

    if (!groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'TransactionSchedule cannot be updated',
        })
    }

    const existing = await TransactionScheduleService.findByIdAndGroupId(
        id,
        groupId,
    )
    if (!existing) {
        throw new HTTPException(NOT_FOUND, {
            message: 'TransactionSchedule not found',
        })
    }

    const input = c.req.valid('json')
    const data = await TransactionScheduleService.update(existing.id, {
        ...input,
        groupId,
    })

    return c.json(
        {
            data,
            message: 'TransactionSchedule updated successfully',
            success: true,
        },
        OK,
    )
}

const DeleteTransactionScheduleDef = createRoute({
    path: `${path}/:id`,
    tags,
    method: 'delete',
    middleware: [
        checkToken,
        checkPermission(['TransactionSchedule:Delete']),
    ] as const,
    request: {
        params: zId,
    },
    responses: {
        [OK]: ApiResponse(
            zSelectTransactionSchedule,
            'Deleted TransactionSchedule',
        ),
    },
})

const DeleteTransactionSchedule: AppRouteHandler<
    typeof DeleteTransactionScheduleDef
> = async (c) => {
    const { groupId } = c.get('jwtPayload') as AccessTokenPayload
    const id = c.req.valid('param').id

    if (!groupId) {
        throw new HTTPException(FORBIDDEN, {
            message: 'TransactionSchedule cannot be deleted',
        })
    }

    const existing = await TransactionScheduleService.findByIdAndGroupId(
        id,
        groupId,
    )
    if (!existing) {
        throw new HTTPException(NOT_FOUND, {
            message: 'TransactionSchedule not found',
        })
    }

    try {
        await TransactionScheduleService.delete(existing.id)

        return c.json(
            {
                data: existing,
                message: 'TransactionSchedule deleted successfully',
                success: true,
            },
            OK,
        )
    } catch (error) {
        throw new HTTPException(
            error instanceof Error
                ? (error.cause as ContentfulStatusCode)
                : INTERNAL_SERVER_ERROR,
            {
                message:
                    (error as Error).message ??
                    'Failed to delete TransactionSchedule',
            },
        )
    }
}

export const transactionScheduleCrudRoutes = createRouter()
    .openapi(GetTransactionScheduleListDef, GetTransactionScheduleList)
    .openapi(CreateTransactionScheduleDef, CreateTransactionSchedule)
    .openapi(UpdateTransactionScheduleDef, UpdateTransactionSchedule)
    .openapi(DeleteTransactionScheduleDef, DeleteTransactionSchedule)
    .openapi(GetTransactionScheduleDef, GetTransactionSchedule)
