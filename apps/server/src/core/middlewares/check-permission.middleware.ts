import { Context, MiddlewareHandler, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { BAD_REQUEST, FORBIDDEN } from 'stoker/http-status-codes'
import { findAllClaimsList } from '../../main/claim/claim.service'
import { fetchRoleClaims } from '../../main/role/role.service'

export const checkPermission = (claims: string[]): MiddlewareHandler => {
    return async (ctx: Context, next: Next) => {
        const allClaims = findAllClaimsList()
        const requiredClaims = claims.map((c) => c.trim().toLowerCase())
        const matchesAtLeastOne = requiredClaims.some((c) =>
            allClaims.includes(c),
        )

        if (!matchesAtLeastOne) {
            throw new HTTPException(BAD_REQUEST, {
                message: 'Invalid claim(s) provided',
            })
        }

        const payload = await ctx.get('jwtPayload')
        const { roleId } = payload
        if (!roleId) {
            throw new HTTPException(BAD_REQUEST, {
                message: 'No role assigned to the logged in user',
            })
        }

        const roleClaims = await fetchRoleClaims(roleId)
        if (!roleClaims) {
            throw new HTTPException(BAD_REQUEST, {
                message: 'No role found for logged in user',
            })
        }

        const hasAllClaims = requiredClaims.every((claim) =>
            roleClaims.includes(claim),
        )
        if (!hasAllClaims) {
            throw new HTTPException(FORBIDDEN, {
                message: 'You do not have permission to perform this action',
            })
        }

        await next()
    }
}
