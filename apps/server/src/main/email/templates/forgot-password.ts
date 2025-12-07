import { EmailTemplateBuilder } from './common-template'

export interface ForgotPasswordEmailTemplateProps {
    firstName: string
    lastName: string
    resetPasswordUrl: string
}

const ForgotPasswordEmailContent = (_props: ForgotPasswordEmailTemplateProps) => `
  <tr>
    <td style="padding: 30px 40px; text-align: left;">
      <h1 style="margin-top: 0; font-size: 24px; color: #333333;">Hi {{firstName}} {{lastName}},</h1>
      <p style="font-size: 16px; color: #555555; margin-top: 20px;">
        We received a request to reset your password.
      </p>
      <p style="font-size: 16px; color: #555555;">
        If you made this request, you can reset your password by clicking the button below:
      </p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="{{resetPasswordUrl}}" target="_blank" style="background-color: #22c55e; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; display: inline-block;">
          Reset Password
        </a>
      </p>
      <p style="font-size: 16px; color: #555555;">
        If you did not request a password reset, you can safely ignore this email or contact our support team if you have concerns.
      </p>
      <p style="font-size: 14px; color: #999999; margin-top: 30px;">
        If the button above doesn't work, copy and paste the following URL into your browser:
      </p>
      <p style="font-size: 14px; color: #007bff; word-break: break-all;">
        {{resetPasswordUrl}}
      </p>
      <p style="font-size: 16px; color: #555555; margin-top: 40px;">
        Thank you!
      </p>
    </td>
  </tr>
`

export function buildForgotPasswordEmailTemplate(props: ForgotPasswordEmailTemplateProps): string {
    return new EmailTemplateBuilder<ForgotPasswordEmailTemplateProps>()
        .setBodyTemplate(ForgotPasswordEmailContent(props))
        .build(props)
}
