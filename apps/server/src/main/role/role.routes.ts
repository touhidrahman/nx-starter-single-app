import { createRouter } from '../../core/create-app'
import { createRoleHandler, createRoleRoute } from './routes/create-role'
import { deleteRoleHandler, deleteRoleRoute } from './routes/delete-role'
import { getRoleHandler, getRoleRoute } from './routes/get-role'
import { listRolesHandler, listRolesRoute } from './routes/list-roles'
import { updateRoleHandler, updateRoleRoute } from './routes/update-role'

export const roleV1Routes = createRouter()
    .openapi(createRoleRoute, createRoleHandler)
    .openapi(listRolesRoute, listRolesHandler)
    .openapi(getRoleRoute, getRoleHandler)
    .openapi(updateRoleRoute, updateRoleHandler)
    .openapi(deleteRoleRoute, deleteRoleHandler)
