import { createRouter } from '../../core/create-app'
import {
    addSubscriptionToGroupHandler,
    addSubscriptionToGroupRoute,
} from './routes/add-pricing-plan-group'
import {
    addUserToGroupHandler,
    addUserToGroupRoute,
} from './routes/add-user-to-group'
import { createGroupHandler, createGroupRoute } from './routes/create-group'
import {
    deleteGroupByIdRoute,
    deleteGroupHandler,
} from './routes/delete-group-by-Id'
import {
    getGroupByIDRoute,
    getGroupByIdHandler,
} from './routes/get-group-by-id'
import { getGroupsHandler, getGroupsRoute } from './routes/get-groups'
import { getMyGroupsHandler, getMyGroupsRoute } from './routes/get-my-groups'
import {
    getGroupOwnerOverviewByGroupIdHandler,
    getGroupOwnerOverviewByGroupIdRoute,
} from './routes/get-owner-overview-by-groupId'
import { leaveGroupHandler, leaveGroupRoute } from './routes/leave-group'
import {
    removeUserFromGroupHandler,
    removeUserFromGroupRoute,
} from './routes/remove-user-from-group'
import {
    updateGroupByIdRoute,
    updateGroupHandler,
} from './routes/update-group-by-id'
import {
    updateUserRoleHandler,
    updateUserRoleRoute,
} from './routes/update-user-role'

export const groupsV1Route = createRouter()
    .openapi(
        getGroupOwnerOverviewByGroupIdRoute,
        getGroupOwnerOverviewByGroupIdHandler,
    )
    .openapi(getMyGroupsRoute, getMyGroupsHandler)
    .openapi(getGroupsRoute, getGroupsHandler)
    .openapi(createGroupRoute, createGroupHandler)
    .openapi(getGroupByIDRoute, getGroupByIdHandler)
    .openapi(updateGroupByIdRoute, updateGroupHandler)
    .openapi(deleteGroupByIdRoute, deleteGroupHandler)
    .openapi(addUserToGroupRoute, addUserToGroupHandler)
    .openapi(updateUserRoleRoute, updateUserRoleHandler)
    .openapi(removeUserFromGroupRoute, removeUserFromGroupHandler)
    .openapi(leaveGroupRoute, leaveGroupHandler)
    .openapi(addSubscriptionToGroupRoute, addSubscriptionToGroupHandler)
