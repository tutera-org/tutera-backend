export interface UserRegisteredVars {
  name: string;
  loginUrl: string;
}

export interface StudentRegistrationVars {
  name: string;
  institution: string;
  loginUrl: string;
}

export interface EnrollmentConfirmationVars {
  name: string;
  courseName: string;
  startDate: string;
}

export interface PasswordResetVars {
  name: string;
  code: string;
  expires: number;
}

export interface GenericNameVars {
  name: string;
}

export interface AdminAlertVars {
  message: string;
  level: 'info' | 'warning' | 'critical';
  details?: string;
}

export interface TenantSuspendedVars {
  name: string;
  reason: string;
  suspendedAt: Date;
}
export interface UserAccountSuspendedVars {
  name: string;
  reason: string;
  suspendedAt: Date;
}

export interface TenantActivatedVars {
  name: string;
  activatedAt: Date;
}

export interface PasswordConfirmationVars {
  name: string;
  code: string;
  expiresAt: Date;
}

export interface UserProfileUpdatedVars {
  name: string;
  updated: Date;
}
export interface UserSubscriptionChangedVars {
  name: string;
  subscription: string;
  updated: Date;
}
export interface SubscriptionActivationVars {
  name: string;
  subscription: string;
  activatedAt: Date;
}

export interface TrialExpiringVars {
  name: string;
  trialEndsAt: Date;
}
export interface UserViolationVars {
  name: string;
}
export interface UserAccountActivatedVars {
  name: string;
  activatedAt: Date;
}
export interface UserAccountLockedVars {
  name: string;
  lockedUntil: Date;
}
export type TemplatePrimitive = string | number | boolean | null;

//Template data key/value pairs
export interface TemplateData {
  [key: string]: TemplatePrimitive;
}

//Data required when queueing/scheduling an email
export interface ScheduledEmailData {
  to: string;
  template: EmailTemplateName;

  // MUST be TemplateData (strict-safe)
  data: TemplateData;

  // delayMinutes must be optional BUT we normalize it
  delayMinutes?: number;
}

// Final parameters passed into email service
export interface ScheduleEmailParams {
  to: string;
  template: EmailTemplateName;
  data: TemplateData;
  delayMinutes: number; // NOT optional here
}

export type EmailTemplateName =
  | 'user.registered'
  | 'user.studentRegistration'
  | 'user.enrollmentConfirmation'
  | 'user.passwordReset'
  | 'user.passwordConfirmation'
  | 'user.profileUpdated'
  | 'user.subscriptionChanged'
  | 'user.subscriptionActivation'
  | 'user.trialExpiring'
  | 'user.violation'
  | 'user.accountSuspended'
  | 'user.accountActivated'
  | 'tenant.suspended'
  | 'tenant.activated'
  | 'user.accountLocked'
  | 'admin.alert';

export type TemplateVars = {
  'user.registered': UserRegisteredVars;
  'user.studentRegistration': StudentRegistrationVars;
  'user.enrollmentConfirmation': EnrollmentConfirmationVars;
  'user.passwordReset': PasswordResetVars;
  'user.passwordConfirmation': PasswordConfirmationVars;
  'user.profileUpdated': UserProfileUpdatedVars;
  'user.subscriptionChanged': UserSubscriptionChangedVars;
  'user.subscriptionActivation': SubscriptionActivationVars;
  'user.trialExpiring': TrialExpiringVars;
  'user.violation': UserViolationVars;
  'user.accountSuspended': UserAccountSuspendedVars;
  'user.accountActivated': UserAccountActivatedVars;
  'tenant.suspended': TenantSuspendedVars;
  'tenant.activated': TenantActivatedVars;
  'user.accountLocked': UserAccountLockedVars;
  'admin.alert': AdminAlertVars;
};
