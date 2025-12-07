import { pgEnum, timestamp } from 'drizzle-orm/pg-core'

export const actionStatusEnum = pgEnum('audit_log_action', ['create', 'update', 'delete'])

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

export const fileTypeEnum = pgEnum('fileType', ['image', 'document', 'video', 'audio'])

export const occuranceFrequencyEnum = pgEnum('occurance_frequency_enum', [
    'Daily',
    'Weekly',
    'Monthly',
    'Yearly',
])

export const timestampColumns = {
    createdAt: timestamp({ withTimezone: true }).defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}
