import { pgEnum, timestamp } from 'drizzle-orm/pg-core'

export const groupTypeEnum = pgEnum('groupType', ['client', 'vendor'])

export const groupStatusEnum = pgEnum('groupStatus', [
    'active',
    'inactive',
    'pending',
])

export const actionStatusEnum = pgEnum('audit_log_action', [
    'create',
    'update',
    'delete',
])

export const feedbackTypeEnum = pgEnum('feedback_type_enum', [
    'feature',
    'general',
    'testimonial',
    'issue',
])

export const feedbackStatusEnum = pgEnum('feedback_status_enum', [
    'pending',
    'inprogress',
    'complete',
    'incomplete',
])

export const fileTypeEnum = pgEnum('fileType', [
    'image',
    'document',
    'video',
    'audio',
])

export const timestampColumns = {
    createdAt: timestamp({ withTimezone: true }).defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}
