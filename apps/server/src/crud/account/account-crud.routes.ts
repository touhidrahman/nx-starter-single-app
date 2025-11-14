import { createRouter } from '../../core/create-app'
import {
    crudCreateAccountHandler,
    crudCreateAccountRoute,
    crudDeleteAccountHandler,
    crudDeleteAccountRoute,
    crudDeleteMultipleAccountsHandler,
    crudDeleteMultipleAccountsRoute,
    crudGetAccountByIdHandler,
    crudGetAccountByIdRoute,
    crudGetAccountsHandler,
    crudGetAccountsRoute,
    crudUpdateAccountHandler,
    crudUpdateAccountRoute,
} from './account-crud.controller'

export const crudAccountRoutes = createRouter()
    .openapi(crudDeleteMultipleAccountsRoute, crudDeleteMultipleAccountsHandler)
    .openapi(crudDeleteAccountRoute, crudDeleteAccountHandler)
    .openapi(crudUpdateAccountRoute, crudUpdateAccountHandler)
    .openapi(crudCreateAccountRoute, crudCreateAccountHandler)
    .openapi(crudGetAccountByIdRoute, crudGetAccountByIdHandler)
    .openapi(crudGetAccountsRoute, crudGetAccountsHandler)
