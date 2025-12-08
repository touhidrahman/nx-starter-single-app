import { EmailTemplateBuilder } from './common-template'

export interface AdminNotificationTemplateProps {
    groupId: string
    groupName: string
    creatorName: string
    creatorEmail: string
    url: string
    status: 'pending' | 'active' | 'inactive'
}

const AdminNotificationContent = (_props: AdminNotificationTemplateProps) => `
  <tr>
    <td style="padding: 30px 40px; text-align: left;">
      <h1 style="font-size: 24px; color: #333333; margin-top: 0;">New Group Created - Requires Approval</h1>
      <p style="font-size: 16px; color: #555555;">A new group has been created and requires your review:</p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #f9fafb;">Group ID</td>
          <td style="padding: 10px; border: 1px solid #ddd;">{{groupId}}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #f9fafb;">Group Name</td>
          <td style="padding: 10px; border: 1px solid #ddd;">{{groupName}}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #f9fafb;">Group Type</td>
          <td style="padding: 10px; border: 1px solid #ddd;">{{groupType}}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #f9fafb;">Created By</td>
          <td style="padding: 10px; border: 1px solid #ddd;">{{creatorName}} ({{creatorEmail}})</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #f9fafb;">Status</td>
          <td style="padding: 10px; border: 1px solid #ddd; color: #d97706;">{{status}}</td>
        </tr>
      </table>

      <p style="margin-top: 30px; text-align: center;">
        <a href="{{url}}" target="_blank" style="background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; display: inline-block;">
          Review Group
        </a>
      </p>

      <p style="font-size: 14px; color: #999999; margin-top: 30px;">
        If the button above doesn't work, copy and paste this link into your browser:
      </p>
      <p style="font-size: 14px; color: #007bff; word-break: break-all;">
        {{url}}
      </p>

      <p style="font-size: 16px; color: #555555; margin-top: 40px;">Thank you!</p>
    </td>
  </tr>
`

export function buildAdminNotificationTemplate(props: AdminNotificationTemplateProps): string {
    return new EmailTemplateBuilder<AdminNotificationTemplateProps>()
        .setBodyTemplate(AdminNotificationContent(props))
        .build(props)
}
