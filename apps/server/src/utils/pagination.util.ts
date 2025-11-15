import { toInt } from 'radash'
import { DEFAULT_PAGE_SIZE } from '../models/common.values'
import { ResponsePagination } from './api-response.util'

export function buildPaginationResponse(
    page: number | undefined,
    size: number | undefined,
    total: number,
): ResponsePagination {
    const numPage = toInt(page, 1) || 1
    const positivePage = numPage < 1 ? 1 : numPage
    const numSize = toInt(size) || DEFAULT_PAGE_SIZE
    const numTotal = toInt(total)
    const totalPages = Math.ceil(numTotal / numSize)
    return {
        page: positivePage,
        size: numSize,
        totalItems: numTotal,
        totalPages,
    }
}
