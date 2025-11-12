import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
    appId: 'me.touhidrahman.app',
    appName: 'MyApp',
    webDir: '../../dist/apps/web/browser',
    server: {
        androidScheme: 'https',
    },
    ios: {
        contentInset: 'always',
    },
    android: {
        includePlugins: ['@capacitor/app'],
    },
    plugins: {
        StatusBar: {
            style: 'DARK',
            overlaysWebView: false,
            backgroundColor: '#ffffffff',
        },
    },
}

export default config
