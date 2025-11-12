import { EmailTemplateBuilder } from './common-template'

export interface PasswordChangeSuccessfulEmailTemplateProps {
    email: string
}

const PasswordChangeSuccessfulContent = (
    _props: PasswordChangeSuccessfulEmailTemplateProps,
) => `
  <tr>
    <td style="padding: 30px 40px; text-align: left;">
      <h1 style="margin-top: 0; font-size: 24px; color: #333333;">Hello, {{email}}</h1>
      <p style="font-size: 16px; color: #555555; margin-top: 20px;">
        We wanted to let you know that your password has been successfully changed.
      </p>
      <p style="font-size: 16px; color: #555555;">
        If you did not initiate this action, please contact our support team immediately.
      </p>
      <p style="font-size: 16px; color: #555555; margin-top: 40px;">
        Best regards,<br>
        <span style="font-weight: 600;">MyApp Support Team</span>
      </p>
    </td>
  </tr>
`

export function buildPasswordChangeSuccessfulEmailTemplate(
    props: PasswordChangeSuccessfulEmailTemplateProps,
): string {
    return new EmailTemplateBuilder<PasswordChangeSuccessfulEmailTemplateProps>()
        .setBodyTemplate(PasswordChangeSuccessfulContent(props))
        .build(props)
}
