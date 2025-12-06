import { subcategoryCoreRoutes } from './subcategory-core.controller'
import { subcategoryCrudRoutes } from './subcategory-crud.controller'
import { subcategoryCustomRoutes } from './subcategory-custom.controller'

export const subcategoryRoutes = [
    subcategoryCustomRoutes,
    subcategoryCrudRoutes,
    subcategoryCoreRoutes,
]
