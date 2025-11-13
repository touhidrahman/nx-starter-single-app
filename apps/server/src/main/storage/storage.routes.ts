import { createRouter } from '../../core/create-app'
import {
    deleteStorageItemHandler,
    deleteStorageItemRoute,
} from './routes/delete-storage-item'
import {
    getStorageItemHandler,
    getStorageItemRoute,
} from './routes/get-storage-item'
import {
    getStorageItemsByGroupHandler,
    getStorageItemsByGroupRoute,
} from './routes/get-storage-items-by-group'
import { uploadHandler, uploadRoute } from './routes/upload'
import { uploadFileHandler, uploadFileRoute } from './routes/upload-file'

export const storageV1Routes = createRouter()
    .openapi(getStorageItemRoute, getStorageItemHandler)
    .openapi(uploadRoute, uploadHandler)
    .openapi(uploadFileRoute, uploadFileHandler)
    .openapi(deleteStorageItemRoute, deleteStorageItemHandler)
    .openapi(getStorageItemsByGroupRoute, getStorageItemsByGroupHandler)
