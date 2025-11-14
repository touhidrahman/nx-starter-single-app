import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3'
import env from '../env'
import { getHashedFileName } from '../utils/file.util'

export const appS3Client = new S3Client({
    region: env.S3_REGION,
    forcePathStyle: true,
    endpoint: env.S3_ENDPOINT,
    credentials: {
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET_KEY,
    },
})

export const databaseBackupS3Client = new S3Client({
    region: env.S3_REGION,
    endpoint: env.S3_ENDPOINT,
    forcePathStyle: true,
    credentials: {
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET_KEY,
    },
    tls: true,
    maxAttempts: 3,
    retryMode: 'standard',
})

export const buildS3Url = (key: string): string => {
    return `${env.S3_BUCKET_URL}/${key}`
}

export const uploadToS3 = async (file: File): Promise<string> => {
    const fileKey = getHashedFileName(file)

    const uploadCommand = new PutObjectCommand({
        Body: Buffer.from(await file.arrayBuffer()),
        Bucket: env.S3_BUCKET,
        Key: fileKey,
        ContentType: file.type,
    })
    try {
        await appS3Client.send(uploadCommand)
        return fileKey
    } catch (error) {
        console.error('Error uploading to S3:', error)
        return ''
    }
}
export const uploadToS3AndGetUrl = async (file: File): Promise<string> => {
    const fileKey = getHashedFileName(file)

    const uploadCommand = new PutObjectCommand({
        Body: Buffer.from(await file.arrayBuffer()),
        Bucket: env.S3_BUCKET,
        Key: fileKey,
        ContentType: file.type,
        ACL: 'public-read',
    })
    try {
        await appS3Client.send(uploadCommand)
        return buildS3Url(fileKey)
    } catch (error) {
        console.error('Error uploading to S3:', error)
        return ''
    }
}

export const getS3File = async (key: string) => {
    const readCommand = new GetObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
    })
    const { Body, ContentType, ContentLength } =
        await appS3Client.send(readCommand)

    return { Body, ContentType, ContentLength }
}

export const deleteS3File = async (key: string): Promise<void> => {
    const deleteCommand = new DeleteObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
    })

    await appS3Client.send(deleteCommand)
}
