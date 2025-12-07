import { InjectionToken } from '@angular/core'
import { AppEnvironmentConfig } from './environment-config.model'

/**
 * Injection token for the validation app environment
 */
export const APP_ENVIRONMENT = new InjectionToken<AppEnvironmentConfig>('ENVIRONMENT')
