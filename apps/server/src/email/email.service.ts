import { Resend } from 'resend'
import env from '../env'

export const resend = new Resend(env.EMAIL_RESEND_API_KEY)

export async function sendEmailUsingResend(to: string[], subject: string, html: string) {
    return resend.emails.send({
        from: env.EMAIL_SENDER_EMAIL,
        to,
        subject,
        html,
    })
}

interface EmailSendResult {
    email: string
    success: boolean
    data?: any
    error?: any
    messageId?: string
    timestamp?: Date
}

export async function sendEmailUsingResendForSaveLog(
    to: string[],
    subject: string,
    html: string,
): Promise<EmailSendResult[]> {
    return Promise.all(
        to.map(async (recipient) => {
            const result: EmailSendResult = {
                email: recipient,
                success: false,
                timestamp: new Date(),
            }

            const { data, error } = await resend.emails.send({
                from: env.EMAIL_SENDER_EMAIL,
                to: [recipient],
                subject,
                html,
            })

            if (error) {
                result.error = error
            } else {
                result.success = true
                result.data = data
                result.messageId = data.id
            }

            return result
        }),
    )
}
