import { intersection, isSubset } from 'es-toolkit/array'
import { Context, MiddlewareHandler, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { BAD_REQUEST, FORBIDDEN } from 'stoker/http-status-codes'
import { AccessTokenPayload } from '../main/auth/auth.model'
import { findAllClaimsList } from '../main/claim/claim.service'
import { RoleCustomService } from '../main/role/custom/role-custom.service'

export const checkPermission = (
    claims: string[],
    matchAll = false,
): MiddlewareHandler => {
    return async (ctx: Context, next: Next) => {
        const payload = (await ctx.get('jwtPayload')) as AccessTokenPayload
        if (!payload) {
            throw new HTTPException(FORBIDDEN, {
                message: 'Unauthorized. User not logged in.',
            })
        }

        const allClaims = findAllClaimsList()
        const requiredClaims = claims.map((c) => c.trim().toLowerCase()) || []
        const matchedRequiredClaims = requiredClaims.filter((c) =>
            allClaims.includes(c),
        )

        if (matchedRequiredClaims.length === 0) {
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

        const role = await RoleCustomService.findById(roleId)
        const rolePermissions =
            role?.permissions?.split(',').map((p) => p.trim().toLowerCase()) ||
            ([] as string[])
        if (!rolePermissions) {
            throw new HTTPException(BAD_REQUEST, {
                message: 'No permission found for logged in user',
            })
        }

        if (matchedRequiredClaims.length > 0) {
            if (matchAll) {
                const allMatch = isSubset(
                    rolePermissions,
                    matchedRequiredClaims,
                )
                if (!allMatch) {
                    throw new HTTPException(FORBIDDEN, {
                        message:
                            'You do not have all the required permission(s) to perform this action',
                    })
                }
                return await next()
            }

            const atLeastOneMatch = intersection(
                rolePermissions,
                matchedRequiredClaims,
            )

            if (atLeastOneMatch.length === 0) {
                throw new HTTPException(FORBIDDEN, {
                    message:
                        'You do not have the required permission to perform this action',
                })
            }
        }

        return await next()
    }
}
