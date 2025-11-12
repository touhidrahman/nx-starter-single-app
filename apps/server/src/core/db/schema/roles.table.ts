import { relations, sql } from 'drizzle-orm'
import { boolean, pgTable, text } from 'drizzle-orm/pg-core'
import { timestampColumns } from './_common.table'
import { generateId } from '../id.util'
import { groupTypeEnum } from './_common.table'
import { groupsTable } from './groups.table'

export const rolesTable = pgTable('roles', {
    id: text().primaryKey().$defaultFn(generateId),
    name: text().notNull(),
    description: text(),
    groupId: text().references(() => groupsTable.id, { onDelete: 'cascade' }),
    claims: text().array().$type<string[]>().default(sql`'{}'::text[]`),
    groupType: groupTypeEnum(),
    isSystemRole: boolean().default(false).notNull(),
    ...timestampColumns,
})

export const roleTableRelations = relations(rolesTable, ({ one }) => ({
    group: one(groupsTable, {
        fields: [rolesTable.groupId],
        references: [groupsTable.id],
    }),
}))
