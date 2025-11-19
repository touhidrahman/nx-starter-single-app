import { SelectAuditLog } from '../core/audit-log-core.model'
import { AuditLogCoreService } from '../core/audit-log-core.service'

export class AuditLogCrudService extends AuditLogCoreService {
    static async findByIdAndCreatorId(
        id: string,
        creatorId: string,
    ): Promise<SelectAuditLog | null> {
        const existing = await AuditLogCrudService.findById(id)
        if (!existing || existing.creatorId !== creatorId) return null
        return existing
    }
}
