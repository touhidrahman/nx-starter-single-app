import { swaggerUI } from '@hono/swagger-ui'
import { AppOpenAPI } from './core.type'

const showApiDocs = process.env.SHOW_SWAGGER_DOCS?.toLowerCase() === 'true'

if (showApiDocs) {
}

export default function configureOpenAPI(app: AppOpenAPI) {
    app.doc('/openapi.json', {
        openapi: '3.0.0',
        info: {
            title: 'Server',
            version: '1.0.0',
            description: 'Server built with Hono',
        },
    })

    if (showApiDocs) {
        app.get(
            '/docs',
            swaggerUI({
                url: '/openapi.json',
            }),
        )
    }
}
