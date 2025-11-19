import { z } from 'zod'
import { auditLogTable } from '../../../db/schema'
import { zPagination, zSearch } from '../../../models/common.schema'
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from '../../../utils/zod.util'

export type InsertAuditLog = z.infer<typeof zInsertAuditLog>
export type SelectAuditLog = z.infer<typeof zSelectAuditLog>
export type UpdateAuditLog = z.infer<typeof zUpdateAuditLog>
export type QueryAuditLogs = z.infer<typeof zQueryAuditLogs>

export const zInsertAuditLog = createInsertSchema(auditLogTable)
export const zSelectAuditLog = createSelectSchema(auditLogTable)
export const zUpdateAuditLog = createUpdateSchema(auditLogTable)
export const zQueryAuditLogs = zInsertAuditLog
    .extend(zSearch.shape)
    .extend(zPagination.shape)
    .partial()
