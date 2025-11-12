import { createRoute, z } from '@hono/zod-openapi'
import {
    BAD_REQUEST,
    INTERNAL_SERVER_ERROR,
    OK,
} from 'stoker/http-status-codes'
import { jsonContent } from 'stoker/openapi/helpers'
import { AppRouteHandler } from '../../../core/core.type'
import { checkToken } from '../../../core/middlewares/check-token.middleware'
import { zEmpty } from '../../../core/models/common.schema'
import {
    deleteS3File,
    uploadToS3AndGetUrl,
} from '../../../core/third-party/s3.service'
import { ApiResponse } from '../../../core/utils/api-response.util'
import { saveLog, toJsonSafe } from '../../audit-log/audit-log.service'
import {
    createStorageRecord,
    deleteStorageItemById,
    getStorageItemByGroupId,
} from '../../storage/storage.service'
import { zProfilePicture, zSelectUser } from '../user.schema'
import { updateUserProfilePictureUrl } from '../user.service'
import { passwordRemoved } from '../user.util'

export const updateUserProfilePictureRoute = createRoute({
    path: '/v1/user/profile/upload-profile-picture',
    method: 'post',
    tags: ['User'],
    middleware: [checkToken] as const,
    request: {
        body: jsonContent(zProfilePicture, 'Profile picture'),
    },
    responses: {
        [OK]: ApiResponse(zSelectUser, 'Profile picture updated successfully'),
        [BAD_REQUEST]: ApiResponse(zEmpty, 'Invalid file error'),
        [INTERNAL_SERVER_ERROR]: ApiResponse(zEmpty, 'Internal Server error'),
    },
})
export const updateUserProfilePictureHandler: AppRouteHandler<
    typeof updateUserProfilePictureRoute
> = async (c) => {
    const body = await c.req.parseBody({ all: true })
    const file = body['file'] as File
    const payload = await c.get('jwtPayload')

    try {
        const errors: string[] = []
        const allowedFormats = ['image/jpeg', 'image/png']
        const MAX_FILE_SIZE = 5 * 1024 * 1024

        if (!file) errors.push('No file provided')

        if (!allowedFormats.includes(file.type))
            errors.push('Invalid file type')
        if (file.size > MAX_FILE_SIZE) errors.push('File size exceeds limit')

        if (errors.length > 0)
            c.json(
                {
                    data: {},
                    message: 'File validation errors occured',
                    error: errors,
                    success: false,
                },
                BAD_REQUEST,
            )

        if (!payload.sub) {
            return c.json(
                {
                    data: {},
                    message: 'Unauthorized!',
                    success: false,
                },
                BAD_REQUEST,
            )
        }

        const item = await getStorageItemByGroupId(payload.groupId)
        if (item?.url && item.url !== '') {
            const key = item?.url?.split('/').pop() ?? ''
            await deleteS3File(key)
            await deleteStorageItemById(item?.id)
        }

        const profilePictureUrl = await uploadToS3AndGetUrl(file)

        const doc = await createStorageRecord({
            file,
            url: profilePictureUrl,
            groupId: payload.groupId,
            entityName: 'user',
            uploadedBy: payload.sub,
        })

        await saveLog(
            'storage',
            item?.id ?? '',
            payload.sub,
            'update',
            toJsonSafe(item ?? {}),
            toJsonSafe(doc ?? {}),
        )

        const [updatedUser] = await updateUserProfilePictureUrl(
            profilePictureUrl,
            payload.sub,
        )

        if (!updatedUser) {
            return c.json(
                {
                    data: {},
                    message: 'User not found!',
                    success: false,
                },
                BAD_REQUEST,
            )
        }

        return c.json(
            {
                data: passwordRemoved(updatedUser),
                message: 'Profile photo uploaded successfully',
                success: true,
            },
            OK,
        )
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json(
                {
                    data: {},
                    message:
                        'An error occurred while uploading the profile picture',
                    success: false,
                    error: error.errors,
                },
                BAD_REQUEST,
            )
        }
        return c.json(
            {
                data: {},
                message:
                    'An error occurred while uploading the profile picture',
                success: false,
                error: error,
            },
            INTERNAL_SERVER_ERROR,
        )
    }
}
