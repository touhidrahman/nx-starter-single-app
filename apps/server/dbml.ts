import { pgGenerate } from 'drizzle-dbml-generator'
import * as schema from './src/db/schema/index'

const out = './apps/server/schema.dbml'
const relational = true

pgGenerate({ schema, out, relational })
