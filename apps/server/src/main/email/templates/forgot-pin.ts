import { EmailTemplateBuilder } from './common-template'

export interface ForgotPinEmailTemplateProps {
    firstName: string
    lastName: string
    pin: string
}

const ForgotPinEmailContent = (_props: ForgotPinEmailTemplateProps) => `
  <tr>
    <td style="padding: 30px 40px; text-align: left;">
      <h1 style="margin-top: 0; font-size: 24px; color: #333333;">Hi {{firstName}} {{lastName}},</h1>
      <p style="font-size: 16px; color: #555555; margin-top: 20px;">
        Your PIN Code is <span class="font-size:24px; font-weight: bold; ">{{pin}}</span>
      </p>

      <p style="font-size: 16px; color: #555555; margin-top: 40px;">
        Thank you!
      </p>
    </td>
  </tr>
`

export function buildForgotPinEmailTemplate(props: ForgotPinEmailTemplateProps): string {
    return new EmailTemplateBuilder<ForgotPinEmailTemplateProps>()
        .setBodyTemplate(ForgotPinEmailContent(props))
        .build(props)
}
