import { Injectable } from '@angular/core'
import * as packageJSON from 'package.json'

interface AppVersion {
    version: string
    name: string
    license: string
}

@Injectable()
export class AppDetailsService {
    getAppDetails(): AppVersion {
        return packageJSON
    }
}
