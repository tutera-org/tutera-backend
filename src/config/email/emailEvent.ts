import { sendEmail, type TemplateData } from './sendEmail.ts';

export type EmailEvent =
  | 'user.registered'
  | 'user.enrollmentConfirmation'
  | 'user.passwordReset'
  | 'user.profileUpdated'
  | 'user.subscriptionChanged'
  | 'user.subscriptionActivation'
  | 'user.trialExpiring'
  | 'user.violation'
  | 'admin.alert';

interface EmailPayload {
  to: string;
  data: TemplateData;
}

const subjectMap: Record<EmailEvent, string> = {
  'user.registered': 'Welcome to Tutera LMS!',
  'user.enrollmentConfirmation': 'Enrollment Confirmation',
  'user.passwordReset': 'Reset Your Password',
  'user.profileUpdated': 'Your Profile Was Updated',
  'user.subscriptionChanged': 'Subscription Update',
  'user.subscriptionActivation': 'Subscription Activated',
  'user.trialExpiring': 'Your Trial is Expiring Soon',
  'user.violation': 'Content Violation Warning',
  'admin.alert': 'Admin Alert: Suspicious Activity',
};

const templateMap: Record<EmailEvent, string> = {
  'user.registered': 'welcome',
  'user.enrollmentConfirmation': 'enrollment-confirmation',
  'user.passwordReset': 'forgot-password',
  'user.profileUpdated': 'profile-update',
  'user.subscriptionChanged': 'subscription-change',
  'user.subscriptionActivation': 'subscription-activated',
  'user.trialExpiring': 'trial-expiring',
  'user.violation': 'violation-warning',
  'admin.alert': 'admin-alert',
};

export async function handleEmailEvent(event: EmailEvent, payload: EmailPayload): Promise<void> {
  const subject = subjectMap[event];
  const template = templateMap[event];

  await sendEmail(payload.to, subject, template, {
    ...payload.data,
    year: new Date().getFullYear(),
  });
}
