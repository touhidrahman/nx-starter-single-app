import { Route } from '@angular/router'
import { AdminRoutes, adminRoutes } from './pages/admin/admin.routes'
import { AppointmentsRoutes, appointmentsRoutes } from './pages/appointments/appointments.routes'
import { AuthRoutes, authRoutes } from './pages/auth/auth.routes'
import { CalendarRoutes, calendarRoutes } from './pages/calendar/calendar.routes'
import { CaseRoutes, caseRoutes } from './pages/case/case.routes'
import { CauseListRoutes, causeListRoutes } from './pages/cause-list/cause-list.routes'
import { ClientRoutes, clientRoutes } from './pages/client/client.routes'
import {
    CommunicationRoutes,
    communicationRoutes,
} from './pages/communication/communication.routes'
import { CourtsRoutes, courtsRoutes } from './pages/courts/courts.routes'
import { DocumentsRoutes, documentsRoutes } from './pages/documents/documents.routes'
import { FeedbackRoutes, feedbackRoutes } from './pages/feedback/feedback.routes'
import { HomeRoutes, homeRoutes } from './pages/home/home.routes'
import { LawyerRoutes, lawyerRoutes } from './pages/lawyer/lawyer.routes'
import { notFoundRoutes } from './pages/not-found/not-found.routes'
import { OrganizationRoutes, organizationRoutes } from './pages/organization/organization.routes'
import {
    PrivacyPolicyRoutes,
    privacyPolicyRoutes,
} from './pages/privacy-policy/privacy-policy.routes'
import { ProfileRoutes, profileRoutes } from './pages/profile/profile.routes'
import { PublicRoutes, publicRoutes } from './pages/public/public.routes'
import { ReferralRoutes, referralRoutes } from './pages/referral/referral.routes'
import {
    RoleSelectionRoutes,
    roleSelectionRoutes,
} from './pages/role-selection/role-selection.routes'
import { SettingsRoutes, settingsRoutes } from './pages/settings/settings.routes'
import { TasksRoutes, tasksRoutes } from './pages/tasks/tasks.routes'

type AppRouteGroups = [
    AdminRoutes,
    AppointmentsRoutes,
    AuthRoutes,
    CalendarRoutes,
    CaseRoutes,
    CauseListRoutes,
    ClientRoutes,
    CommunicationRoutes,
    CourtsRoutes,
    DocumentsRoutes,
    FeedbackRoutes,
    HomeRoutes,
    LawyerRoutes,
    OrganizationRoutes,
    PrivacyPolicyRoutes,
    ProfileRoutes,
    PublicRoutes,
    ReferralRoutes,
    RoleSelectionRoutes,
    SettingsRoutes,
    TasksRoutes,
]

const groupedRoutes: AppRouteGroups = [
    adminRoutes,
    appointmentsRoutes,
    authRoutes,
    calendarRoutes,
    caseRoutes,
    causeListRoutes,
    clientRoutes,
    communicationRoutes,
    courtsRoutes,
    documentsRoutes,
    feedbackRoutes,
    homeRoutes,
    lawyerRoutes,
    organizationRoutes,
    privacyPolicyRoutes,
    profileRoutes,
    publicRoutes,
    referralRoutes,
    roleSelectionRoutes,
    settingsRoutes,
    tasksRoutes,
]

const flattenedRoutes: Route[] = []
for (const routeGroup of groupedRoutes) {
    for (const route of Object.values(routeGroup)) {
        flattenedRoutes.push(route)
    }
}
flattenedRoutes.push(notFoundRoutes.notFound)

export const appRoutes = flattenedRoutes
