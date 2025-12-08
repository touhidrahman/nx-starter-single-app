import { EmailTemplateBuilder } from './common-template'

export interface DeletedAccountEmailTemplateProps {
    firstName: string
    lastName: string
    email: string
    signupUrl: string
}

const DeletedAccountEmailContent = (_props: DeletedAccountEmailTemplateProps) => `
  <tr>
    <td style="padding: 30px 40px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px; color: #333333;">
        Your Account Has Been Deleted
      </h1>

      <p style="font-size: 16px; color: #555555; margin-top: 20px;">
        Hi {{firstName}} {{lastName}},
      </p>

      <p style="font-size: 16px; color: #555555;">
        Since your account associated with <strong>{{email}}</strong> has been inactive for a long period,
        it has now been <strong>permanently deleted</strong> from our system in accordance with our inactive account policy.
      </p>

      <p style="font-size: 16px; color: #555555;">
        All of your personal data, preferences, and saved information have been removed.
        <strong>If you created or managed any organization(s), those have also been deleted</strong> along with your account and their related data.
      </p>

      <p style="font-size: 16px; color: #555555;">
        We’re sorry to see you go — but you’re always welcome to return.
        If you’d like to use our services again, simply create a new account below.
      </p>

      <p style="margin: 30px 0;">
        <a href="{{signupUrl}}" target="_blank" style="background-color: #6b7280; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; display: inline-block;">
          Create New Account
        </a>
      </p>

      <p style="font-size: 14px; color: #999999; margin-top: 20px;">
        If the button above doesn't work, copy and paste this link into your browser:
      </p>

      <p style="font-size: 14px; color: #007bff; word-break: break-all;">
        {{signupUrl}}
      </p>

      <p style="font-size: 16px; color: #555555; margin-top: 40px;">
        Thank you for being part of our community — we hope to see you again in the future.
        <br><strong>The Team</strong>
      </p>
    </td>
  </tr>
`

export function buildDeletedAccountEmailTemplate(props: DeletedAccountEmailTemplateProps): string {
    return new EmailTemplateBuilder<DeletedAccountEmailTemplateProps>()
        .setBodyTemplate(DeletedAccountEmailContent(props))
        .build(props)
}
