import { EmailTemplateBuilder } from './common-template'

export interface InviteUserEmailTemplateProps {
    invitationUrl: string
    organizationName?: string
}

const InviteUserEmailContent = (_props: InviteUserEmailTemplateProps) => `
  <tr>
    <td style="padding: 30px 40px; text-align: left;">
      <h1 style="color: #333333; margin-top: 0;">Hello!</h1>
      <p style="font-size: 16px; color: #555555;">
        You have been invited to join <strong>{{organizationName}}</strong>.
      </p>
      <p style="font-size: 16px; color: #555555;">
        Please click the button below to accept the invitation:
      </p>
      <p style="margin: 30px 0; text-align: center;">
        <a href="{{invitationUrl}}" target="_blank" style="background-color: #22c55e; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; display: inline-block;">
          Join Now
        </a>
      </p>
      <p style="font-size: 14px; color: #999999; margin-top: 10px;">
        If the button above doesn't work, copy and paste this link into your browser:
      </p>
      <p style="font-size: 14px; color: #007bff; word-break: break-all;">
        {{invitationUrl}}
      </p>
      <p style="font-size: 16px; color: #555555; margin-top: 30px;">
        We look forward to having you on board!
      </p>
      <p style="font-size: 16px; color: #555555;">
        Thank you!
      </p>
    </td>
  </tr>
`

export function buildInviteUserEmailTemplate(props: InviteUserEmailTemplateProps): string {
    return new EmailTemplateBuilder<InviteUserEmailTemplateProps>()
        .setBodyTemplate(InviteUserEmailContent(props))
        .build(props)
}
