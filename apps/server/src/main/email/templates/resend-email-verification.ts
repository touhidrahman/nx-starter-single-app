import { EmailTemplateBuilder } from './common-template'

export interface ResendVerificationTemplateProps {
    firstName: string
    lastName: string
    email: string
    verificationUrl: string
}

const ResendVerificationEmailContent = (
    _props: ResendVerificationTemplateProps,
) => `
  <tr>
    <td style="padding: 30px 40px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px; color: #333333;">Welcome, {{firstName}} {{lastName}}!</h1>
      <p style="font-size: 16px; color: #555555;">
        Please verify your email address by clicking the button below:
      </p>
      <p style="margin: 30px 0;">
        <a href="{{verificationUrl}}" target="_blank" style="background-color: #22c55e; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; display: inline-block;">
          Verify Email
        </a>
      </p>
      <p style="font-size: 14px; color: #999999; margin-top: 20px;">
        If the button above doesn't work, copy and paste this link into your browser:
      </p>
      <p style="font-size: 14px; color: #007bff; word-break: break-all;">
        {{verificationUrl}}
      </p>
      <p style="font-size: 16px; color: #555555; margin-top: 40px;">
        Thank you!
      </p>
    </td>
  </tr>
`

export function buildResendVerificationEmailTemplate(
    props: ResendVerificationTemplateProps,
): string {
    return new EmailTemplateBuilder<ResendVerificationTemplateProps>()
        .setBodyTemplate(ResendVerificationEmailContent(props))
        .build(props)
}
