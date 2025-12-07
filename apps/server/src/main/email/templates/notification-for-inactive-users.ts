import { EmailTemplateBuilder } from './common-template'

export interface InactiveUsersEmailTemplateProps {
    firstName: string
    lastName: string
    email: string
    loginUrl: string
    days: number
}

const InactiveUsersEmailContent = (_props: InactiveUsersEmailTemplateProps) => `
  <tr>
  <td style="padding: 40px; background-color: #f3f4f6; text-align: center; font-family: 'Segoe UI', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); overflow: hidden;">
      <tr>
        <td style="padding: 40px 30px 20px 30px; text-align: center; background-color: #fef2f2;">
          <h1 style="margin: 0; font-size: 24px; color: #b91c1c; font-weight: 700;">
           Reminder: Account Deletion Notice
          </h1>
        </td>
      </tr>
      <tr>
        <td style="padding: 20px 40px 10px 40px; text-align: left;">
          <p style="font-size: 17px; color: #111827; margin: 0;">
            Hi <strong>{{firstName}} {{lastName}}</strong>,
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding: 10px 40px 0 40px; text-align: left;">
          <p style="font-size: 16px; color: #4b5563; line-height: 1.7; margin: 0;">
            It’s been <strong>{{days}} days</strong> since your last login. Due to prolonged inactivity, your account is scheduled for deletion soon.
          </p>
          <p style="font-size: 16px; color: #4b5563; line-height: 1.7; margin-top: 15px;">
            To prevent this and keep your data safe, please log in before your account is permanently removed.
          </p>
        </td>
      </tr>
      <tr>
        <td style="text-align: center; padding: 35px 40px;">
          <a href="{{loginUrl}}" target="_blank"
            style="background-color: #16a34a; color: #ffffff; padding: 14px 36px; text-decoration: none; border-radius: 8px; font-size: 17px; font-weight: 600; display: inline-block;">
            Log In Now
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding: 0 40px 20px 40px; text-align: center;">
          <p style="font-size: 14px; color: #6b7280; margin-bottom: 6px;">
            If the button above doesn't work, copy and paste this link into your browser:
          </p>
          <p style="font-size: 14px; color: #2563eb; word-break: break-all; margin: 0;">
            {{loginUrl}}
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding: 30px 30px 40px 30px; text-align: center; border-top: 1px solid #e5e7eb; background-color: #f9fafb;">
          <p style="font-size: 16px; color: #374151; margin: 0 0 8px 0;">
            We’d hate to lose you — log in today to keep your account active.
          </p>
          <p style="font-size: 16px; color: #111827; font-weight: 600; margin: 0;">
           MyApp Team
          </p>
        </td>
      </tr>

    </table>
  </td>
</tr>
`

export function buildEmailTemplateForInactiveUsers(props: InactiveUsersEmailTemplateProps) {
    return new EmailTemplateBuilder<InactiveUsersEmailTemplateProps>()
        .setBodyTemplate(InactiveUsersEmailContent(props))
        .build(props)
}
