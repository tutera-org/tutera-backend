import { ScheduledEmail } from '../models/ScheduledEmail.ts';
import type { TemplateVars } from './types.ts';

export type EmailEvent = keyof TemplateVars;

export const subjectMap: { [K in EmailEvent]: string } = {
  'user.registered': 'Welcome to Tutera LMS!',
  'user.studentRegistration': 'Student Registration',
  'user.enrollmentConfirmation': 'Enrollment Confirmation',
  'user.passwordReset': 'Reset Your Password',
  'user.passwordConfirmation': 'Confirm Your Password',
  'user.profileUpdated': 'Your Profile Was Updated',
  'user.subscriptionChanged': 'Subscription Update',
  'user.subscriptionActivation': 'Subscription Activated',
  'user.trialExpiring': 'Your Trial is Expiring Soon',
  'user.violation': 'Content Violation Warning',
  'user.accountSuspended': 'Account Suspended',
  'user.accountActivated': 'Account Activated',
  'tenant.suspended': 'Tenant Suspended',
  'tenant.activated': 'Tenant Activated',
  'user.accountLocked': 'Account Locked',
  'admin.alert': 'Admin Alert: Suspicious Activity',
};

export const templateMap: { [K in EmailEvent]: string } = {
  'user.registered': 'welcome',
  'user.studentRegistration': 'student-registration',
  'user.enrollmentConfirmation': 'enrollment-confirmation',
  'user.passwordReset': 'forgot-password',
  'user.passwordConfirmation': 'password-reset-confirmation',
  'user.profileUpdated': 'profile-update',
  'user.subscriptionChanged': 'subscription-change',
  'user.subscriptionActivation': 'subscription-activated',
  'user.trialExpiring': 'trial-expiring',
  'user.violation': 'violation-warning',
  'user.accountSuspended': 'account-suspended',
  'user.accountActivated': 'Account Activated',
  'tenant.suspended': 'tenant-suspended',
  'tenant.activated': 'tenant-activated',
  'user.accountLocked': 'account-locked',
  'admin.alert': 'admin-alert',
};

export interface EmailPayload<T extends EmailEvent> {
  to: string;
  data: TemplateVars[T];
  attachments?: { filename: string; path: string }[];
  scheduledTime?: Date;
}

/**
 * Enqueue an email for processing (stored in DB). Strictly typed per event.
 */
export async function handleEmailEvent<T extends EmailEvent>(
  event: T,
  payload: EmailPayload<T>
): Promise<void> {
  await ScheduledEmail.create({
    to: payload.to,
    subject: subjectMap[event],
    templateName: templateMap[event],
    data: payload.data,
    scheduledTime: payload.scheduledTime ?? new Date(),
    sent: false,
    retryCount: 0,
    attachments: payload.attachments ?? [],
  });
}
