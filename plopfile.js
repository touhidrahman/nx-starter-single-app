import inflection from 'inflection'

export default function (plop) {
    plop.setHelper('pluralize', (str) => inflection.pluralize(str))

    plop.setGenerator('honocontroller', {
        description: 'Create a new Hono route handler',
        prompts: [
            {
                type: 'input',
                name: 'moduleName',
                message: 'Module name in PascalCase (e.g., User, Transaction, AccountType):',
            },
            {
                type: 'input',
                name: 'routeName',
                message: 'Route name in PascalCase (e.g., VerifyPassword):',
            },
        ],
        actions: [
            {
                type: 'add',
                path: 'apps/server/src/main/{{dashCase moduleName}}/{{dashCase moduleName}}-{{dashCase routeName}}.controller.ts',
                templateFile: 'plop-templates/honocontroller/custom.controller.ts.hbs',
            },
        ],
    })

    plop.setGenerator('honomodule', {
        description: 'Create a new Hono module with common api routes',
        prompts: [
            {
                type: 'input',
                name: 'moduleName',
                message: 'Module name in PascalCase (e.g., User, Transaction, AccountType):',
            },
        ],
        actions: [
            {
                type: 'add',
                path: 'apps/server/src/main/{{dashCase moduleName}}/{{dashCase moduleName}}-core.controller.ts',
                templateFile: 'plop-templates/honomodule/core.controller.ts.hbs',
            },
            {
                type: 'add',
                path: 'apps/server/src/main/{{dashCase moduleName}}/{{dashCase moduleName}}-core.service.ts',
                templateFile: 'plop-templates/honomodule/core.service.ts.hbs',
            },
            {
                type: 'add',
                path: 'apps/server/src/main/{{dashCase moduleName}}/{{dashCase moduleName}}-crud.controller.ts',
                templateFile: 'plop-templates/honomodule/crud.controller.ts.hbs',
            },
            {
                type: 'add',
                path: 'apps/server/src/main/{{dashCase moduleName}}/{{dashCase moduleName}}-custom.controller.ts',
                templateFile: 'plop-templates/honomodule/custom.controller.ts.hbs',
            },
            {
                type: 'add',
                path: 'apps/server/src/main/{{dashCase moduleName}}/{{dashCase moduleName}}.model.ts',
                templateFile: 'plop-templates/honomodule/model.ts.hbs',
            },
            {
                type: 'add',
                path: 'apps/server/src/main/{{dashCase moduleName}}/{{dashCase moduleName}}.service.ts',
                templateFile: 'plop-templates/honomodule/service.ts.hbs',
            },
            {
                type: 'add',
                path: 'apps/server/src/main/{{dashCase moduleName}}/{{dashCase moduleName}}.routes.ts',
                templateFile: 'plop-templates/honomodule/routes.ts.hbs',
            },
        ],
    })
}
