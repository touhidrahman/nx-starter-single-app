import { EmailTemplateBuilder } from './common-template'

export interface StatusEmailTemplateProps {
    recipientName: string
    organizationName: string
    url: string
}

const ActiveStatusEmailContent = (_props: StatusEmailTemplateProps) => `
  <tr>
    <td style="padding: 30px 40px; text-align: left;">
      <p style="font-size: 16px; color: #555555; margin: 0;">Dear <strong>{{recipientName}}</strong>,</p>

      <p style="font-size: 16px; color: #555555; margin-top: 20px;">
        Your organization <strong>{{organizationName}}</strong> has been successfully activated!
      </p>

      <p style="font-size: 16px; color: #555555;">
        You can now access your dashboard. Please log in using the button below:
      </p>

      <p style="margin: 30px 0; text-align: center;">
        <a href="{{url}}" target="_blank" style="background-color: #22c55e; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; display: inline-block;">
          Go to Dashboard
        </a>
      </p>

      <p style="font-size: 14px; color: #999999; margin-top: 10px;">
        If the button above doesn't work, copy and paste this link into your browser:
      </p>
      <p style="font-size: 14px; color: #007bff; word-break: break-all;">
        {{url}}
      </p>

      <p style="font-size: 16px; color: #555555; margin-top: 30px;">
        Thank you for your patience.
      </p>
    </td>
  </tr>
`

const InactiveStatusEmailContent = (_props: StatusEmailTemplateProps) => `
  <tr>
    <td style="padding: 30px 40px; text-align: left;">
      <p style="font-size: 16px; color: #555555; margin: 0;">Dear <strong>{{recipientName}}</strong>,</p>

      <p style="font-size: 16px; color: #555555; margin-top: 20px;">
        Your organization <strong>{{organizationName}}</strong> has been <span style="color: #dc2626;">deactivated</span>.
      </p>

      <p style="font-size: 16px; color: #555555;">
        If you believe this is an error, please contact support by clicking the button below:
      </p>

      <p style="margin: 30px 0; text-align: center;">
        <a href="{{url}}" target="_blank" style="background-color: #22c55e; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; display: inline-block;">
          Contact Support
        </a>
      </p>

      <p style="font-size: 14px; color: #999999; margin-top: 10px;">
        If the button above doesn't work, copy and paste this link into your browser:
      </p>
      <p style="font-size: 14px; color: #007bff; word-break: break-all;">
        {{url}}
      </p>

      <p style="font-size: 16px; color: #555555; margin-top: 30px;">
        Thank you.
      </p>
    </td>
  </tr>
`

export function buildActiveStatusEmailTemplate(
    props: StatusEmailTemplateProps,
): string {
    return new EmailTemplateBuilder<StatusEmailTemplateProps>()
        .setBodyTemplate(ActiveStatusEmailContent(props))
        .build(props)
}

export function buildInactiveStatusEmailTemplate(
    props: StatusEmailTemplateProps,
): string {
    return new EmailTemplateBuilder<StatusEmailTemplateProps>()
        .setBodyTemplate(InactiveStatusEmailContent(props))
        .build(props)
}
