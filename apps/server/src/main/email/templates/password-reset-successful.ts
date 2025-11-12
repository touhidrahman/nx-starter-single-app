import { EmailTemplateBuilder } from './common-template'

export interface PasswordResetSuccessfulEmailTemplateProps {
    firstName: string
    lastName: string
}

const PasswordResetSuccessfulContent = (
    _props: PasswordResetSuccessfulEmailTemplateProps,
) => `
  <tr>
    <td style="padding: 30px 40px; text-align: left;">
      <h1 style="margin-top: 0; font-size: 24px; color: #333333;">Hello, {{firstName}} {{lastName}}</h1>
      <h3 style="color: #22c55e; margin-bottom: 20px;">Your Password Has Been Successfully Reset</h3>
      <p style="font-size: 16px; color: #555555; margin-top: 20px; line-height: 1.5;">
        We're confirming that your password has been successfully reset. You can now use your new password to access your account.
      </p>
      <p style="font-size: 16px; color: #555555; line-height: 1.5;">
        If you didn't request this password reset, please contact our support team immediately to secure your account.
      </p>
      <p style="font-size: 16px; color: #555555; margin-top: 30px; line-height: 1.5;">
        For security reasons, we recommend:
      </p>
      <ul style="font-size: 15px; color: #555555; padding-left: 20px;">
        <li style="margin-bottom: 8px;">Using a strong, unique password</li>
        <li style="margin-bottom: 8px;">Enabling two-factor authentication</li>
        <li>Regularly updating your password</li>
      </ul>
      <p style="font-size: 16px; color: #555555; margin-top: 40px;">
        Best regards,<br>
        <span style="font-weight: 600;">MyApp Support Team</span>
      </p>
    </td>
  </tr>
`

export function buildPasswordResetSuccessfulEmailTemplate(
    props: PasswordResetSuccessfulEmailTemplateProps,
): string {
    return new EmailTemplateBuilder<PasswordResetSuccessfulEmailTemplateProps>()
        .setBodyTemplate(PasswordResetSuccessfulContent(props))
        .build(props)
}
