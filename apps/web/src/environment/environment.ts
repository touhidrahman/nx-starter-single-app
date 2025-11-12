import { AppEnvironmentConfig } from '@repo/core'

export const environment: AppEnvironmentConfig = {
    appName: 'MyApp',
    production: false,
    platform: 'development',
    apiUrl: 'http://localhost:3000',
    authApiUrl: 'http://localhost:3000/v1',
}
