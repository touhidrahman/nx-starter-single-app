import { z } from 'zod'
import { zInsertTransaction } from '../basic/transaction-basic.model'

const zCommonInsertTransaction = zInsertTransaction
    .pick({
        groupId: true,
        creatorId: true,
    })
    .required()
