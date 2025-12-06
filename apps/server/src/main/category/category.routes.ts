import { categoryCoreRoutes } from './category-core.controller'
import { categoryCrudRoutes } from './category-crud.controller'
import { categoryCustomRoutes } from './category-custom.controller'

export const categoryRoutes = [
    categoryCustomRoutes,
    categoryCrudRoutes,
    categoryCoreRoutes,
]
