import inflection from 'inflection'

export default function (plop) {
    plop.setHelper('pluralize', (str) => inflection.pluralize(str))

    plop.setGenerator('honomodule', {
        description:
            'Create a new Hono module for private, protected and custom routes',
        prompts: [
            {
                type: 'input',
                name: 'moduleName',
                message: 'Module name (e.g., user, admin):',
            },
        ],
        actions: [
            {
                type: 'add',
                path: 'apps/server/src/main/{{dashCase moduleName}}/{{dashCase moduleName}}-core.routes.ts',
                templateFile: 'plop-templates/honomodule/core.routes.ts.hbs',
            },
            {
                type: 'add',
                path: 'apps/server/src/main/{{dashCase moduleName}}/{{dashCase moduleName}}.model.ts',
                templateFile: 'plop-templates/honomodule/core.model.ts.hbs',
            },
        ],
    })
}
