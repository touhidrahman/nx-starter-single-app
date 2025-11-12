// import { Embedders } from 'meilisearch'
import { meiliClient } from '../utils/meilisearch'

export async function setupCourtsIndex() {
    try {
        await meiliClient.deleteIndex('courts')

        await meiliClient.createIndex('courts', { primaryKey: 'id' })

        /* const embedders = {
            'products-openai': {
                source: 'openAi',
                apiKey: <OpenAI_API_KEY>,
                model: 'text-embedding-3-small',
                documentTemplate:
                    "A court named '{{doc.nameEn}}' ({{doc.nameBn}}) located in district '{{doc.districtNameEn}}' ({{doc.districtNameBn}}).",
            },
        } as Embedders */

        await meiliClient.index('courts').updateSettings({
            searchableAttributes: ['nameEn', 'nameBn'],
            filterableAttributes: [
                'externalCourtId',
                'districtNameEn',
                'districtNameBn',
                'isGlobal',
                'groupId',
            ],
            sortableAttributes: ['nameEn', 'districtNameEn'],
            /* embedders, */
        })

        await meiliClient.index('courts').updateTypoTolerance({
            minWordSizeForTypos: {
                oneTypo: 3,
                twoTypos: 7,
            },
        })

        console.log('✅ Courts index setup completed')
    } catch (error) {
        console.error('❌ Failed to setup courts index:', error)
        throw error
    }
}
