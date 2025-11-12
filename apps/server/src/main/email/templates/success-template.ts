import env from '../../../env'
import { EmailTemplateBuilder } from './common-template'

export interface SuccessEmailTemplateProps {
    recipientName: string
    profileType: 'vendor' | 'client'
    dashboardUrl: string
    loginUrl: string
    organizationName?: string
}

const SuccessEmailContent = (props: SuccessEmailTemplateProps) => {
    const isVendor = props.profileType === 'vendor'

    return `
      <tr>
        <td style="padding: 30px 40px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; color: #333333;">Congratulations, {{recipientName}}!</h1>
          <p style="font-size: 16px; color: #555555; margin-top: 20px;">
            ${isVendor
            ? 'Your vendor organization {{organizationName}} has been successfully created on MyApp.'
            : 'Your organization {{organizationName}} has been successfully created on MyApp.'
        }
          </p>

          <p style="margin: 30px 0;">
            <a href="{{loginUrl}}" target="_blank" style="background-color: #22c55e; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; display: inline-block;">
              Login now
            </a>
          </p>
          <p style="font-size: 14px; color: #999999; margin-top: 20px;">
            If the link does not work, copy and paste the following URL into your browser:
          </p>
          <p style="font-size: 14px; color: #007bff; word-break: break-word;">
            {{loginUrl}}
          </p>
          <p style="font-size: 16px; color: #555555; margin-top: 40px;">
            Thank you for choosing <a href="{{dashboardUrl}}" style="color: #22c55e; text-decoration: none;">${env.FRONTEND_URL}</a>!
          </p>
        </td>
      </tr>
    `
}

export function buildSuccessEmailTemplate(
    props: SuccessEmailTemplateProps,
): string {
    return new EmailTemplateBuilder<SuccessEmailTemplateProps>()
        .setBodyTemplate(SuccessEmailContent(props))
        .build(props)
}
