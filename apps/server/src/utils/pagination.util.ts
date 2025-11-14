import { toInt } from 'radash'
import { DEFAULT_PAGE_SIZE } from '../models/common.values'
import { ResponsePagination } from './api-response.util'

export function buildPaginationResponse(
    page: number | undefined,
    size: number | undefined,
    total: number,
): ResponsePagination {
    return {
        page: toInt(page) || 1,
        size: toInt(size) || DEFAULT_PAGE_SIZE,
        total,
        totalPages: Math.ceil(total / (toInt(size) || DEFAULT_PAGE_SIZE)),
    }
}
