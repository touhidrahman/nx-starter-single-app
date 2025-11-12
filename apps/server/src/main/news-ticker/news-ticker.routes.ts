import { createRouter } from '../../core/create-app'
import {
    createNewsTickerHandler,
    createNewsTickerRoute,
} from './routes/create-news-ticker'
import {
    deleteNewsTickerHandler,
    deleteNewsTickerRoute,
} from './routes/delete-news-ticker'
import {
    getNewsTickerHandler,
    getNewsTickerRoute,
} from './routes/get-news-ticker-list'
import {
    updateNewsTickerHandler,
    updateNewsTickerRoute,
} from './routes/update-news-ticker'

export const newsTickerV1Routes = createRouter()
    .openapi(deleteNewsTickerRoute, deleteNewsTickerHandler)
    .openapi(createNewsTickerRoute, createNewsTickerHandler)
    .openapi(updateNewsTickerRoute, updateNewsTickerHandler)
    .openapi(getNewsTickerRoute, getNewsTickerHandler)
