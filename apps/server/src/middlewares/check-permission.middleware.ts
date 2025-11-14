import { Context, MiddlewareHandler, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { BAD_REQUEST, FORBIDDEN } from 'stoker/http-status-codes'
import { AccessTokenPayload } from '../main/auth/token.util'
import { findAllClaimsList } from '../main/claim/claim.service'
import { getRolePermissions } from '../main/role/role.service'

export const checkPermission = (claims: {
    and?: string[]
    or?: string[]
}): MiddlewareHandler => {
    return async (ctx: Context, next: Next) => {
        const payload = (await ctx.get('jwtPayload')) as AccessTokenPayload
        if (!payload) {
            throw new HTTPException(FORBIDDEN, {
                message: 'Unauthorized. User not logged in.',
            })
        }

        const allClaims = findAllClaimsList()
        const requiredAndClaims =
            claims.and?.map((c) => c.trim().toLowerCase()) || []
        const requiredOrClaims =
            claims.or?.map((c) => c.trim().toLowerCase()) || []
        const matchedAndClaims = requiredAndClaims.filter((c) =>
            allClaims.includes(c),
        )
        const matchedOrClaims = requiredOrClaims.filter((c) =>
            allClaims.includes(c),
        )

        if (matchedAndClaims.length === 0 && matchedOrClaims.length === 0) {
            throw new HTTPException(BAD_REQUEST, {
                message: 'Invalid claim(s) provided',
            })
        }

        const { roleId } = payload
        if (!roleId) {
            throw new HTTPException(BAD_REQUEST, {
                message: 'No role assigned to the logged in user',
            })
        }

        const roleClaims = await getRolePermissions(roleId)
        if (!roleClaims) {
            throw new HTTPException(BAD_REQUEST, {
                message: 'No permission found for logged in user',
            })
        }

        if (matchedAndClaims.length > 0) {
            const hasAllAndClaims = matchedAndClaims.every((claim) =>
                roleClaims.includes(claim),
            )
            if (!hasAllAndClaims) {
                throw new HTTPException(FORBIDDEN, {
                    message:
                        'You do not have all the required permissions to perform this action',
                })
            }
        }

        if (matchedOrClaims.length > 0) {
            const hasAtLeastOneOrClaim = matchedOrClaims.some((claim) =>
                roleClaims.includes(claim),
            )
            if (!hasAtLeastOneOrClaim) {
                throw new HTTPException(FORBIDDEN, {
                    message:
                        'You do not have at least one of the required permissions to perform this action',
                })
            }
        }

        await next()
    }
}
