import z from 'zod'
import { zSelectRole } from '../../role/core/role-core.model'
import { zSelectUser } from '../../user/core/user-core.model'

export const zGroupMember = zSelectUser.extend({
    role: zSelectRole.nullable(),
})

export type GroupMember = z.infer<typeof zGroupMember>
