import { Context, MiddlewareHandler, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { BAD_REQUEST, FORBIDDEN } from 'stoker/http-status-codes'
import { AccessTokenPayload } from '../main/auth/auth.model'
import { findAllClaimsList } from '../main/claim/claim.service'
import { RoleCustomService } from '../main/role/custom/role-custom.service'

export const checkPermission = (claims: string[], matchAll = false): MiddlewareHandler => {
    return async (ctx: Context, next: Next) => {
        const payload = (await ctx.get('jwtPayload')) as AccessTokenPayload
        if (!payload) {
            throw new HTTPException(FORBIDDEN, {
                message: 'Unauthorized. User not logged in.',
            })
        }

        const requiredClaims = getValidatedRequiredClaims(claims)

        if (requiredClaims.length === 0) {
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
            role?.permissions?.split(',').map((p) => p.trim().toLowerCase()) || ([] as string[])
        if (!rolePermissions) {
            throw new HTTPException(BAD_REQUEST, {
                message: 'No permission found for logged in user',
            })
        }

        console.log('TCL: | checkPermission | requiredClaims:', requiredClaims)
        if (requiredClaims.length > 0) {
            if (matchAll) {
                // each claim must be available in role permission with `|1` status (= enabled)
                const allMatch = requiredClaims.every((claim) => {
                    const permission = rolePermissions.find((rp) => isPermissionEnabled(claim, rp))
                    console.log('TCL: | checkPermission | permission:', permission)
                    return permission !== undefined
                })
                if (!allMatch) {
                    throw new HTTPException(FORBIDDEN, {
                        message:
                            'You do not have all the required permission(s) to perform this action',
                    })
                }
                return await next()
            }

            const atLeastOneMatch = requiredClaims.some((claim) => {
                const permission = rolePermissions.find((rp) => isPermissionEnabled(claim, rp))
                console.log('TCL: | checkPermission | permission:', permission)
                return permission !== undefined
            })

            if (!atLeastOneMatch) {
                throw new HTTPException(FORBIDDEN, {
                    message: 'You do not have the required permission to perform this action',
                })
            }
        }

        return await next()
    }
}

function isPermissionEnabled(requiredClaim: string, permissionString: string): boolean {
    const [permissionId, status] = permissionString.split('|')
    return permissionId === requiredClaim && status === '1'
}

function getValidatedRequiredClaims(claims: string[]): string[] {
    const allClaims = findAllClaimsList()
    const requiredClaims = claims.map((c) => c.trim().toLowerCase()) || []
    return requiredClaims.filter((c) => allClaims.includes(c))
}
