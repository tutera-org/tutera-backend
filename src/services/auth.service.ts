import { User } from '../models/User.ts';
import { Tenant } from '../models/Tenant.ts';
import { UserRole, SubscriptionStatus } from '../interfaces/index.ts';
import { AppError } from '../utils/AppError.ts';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.ts';
import { addDays } from '../utils/date.ts';
import { TRIAL_PERIOD_DAYS, FRONTEND_URL } from '../config/constants.ts';
import { handleEmailEvent } from '../config/email/emailEvent.ts';
import { createAuditLog } from '../utils/audit.ts';
import type { ClientSession } from 'mongoose';
import { logger } from '../config/logger.ts';

export class AuthService {
  /**
   * Register Institution or Independent Creator
   */
  async registerInstitutionOrIndependent(
    data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: UserRole;
      phoneNumber?: string;
      tenantName?: string;
      tenantType?: 'INSTITUTION' | 'INDEPENDENT_CREATOR';
    },
    session?: ClientSession
  ) {
    // Check if email already exists
    const existingUser = await User.findOne({ email: data.email })
      .session(session ?? null)
      .exec();
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Check if tenant name already exists
    const existingTenant = await Tenant.findOne({ name: data.tenantName })
      .session(session ?? null)
      .exec();
    if (existingTenant) {
      throw new AppError(`School or Institution name ${data.tenantName} already exists`, 409);
    }

    // Validate role
    if (data.role !== UserRole.INSTITUTION && data.role !== UserRole.INDEPENDENT_CREATOR) {
      throw new AppError('Invalid role for this registration', 400);
    }

    // Create user
    const user = new User({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      phoneNumber: data.phoneNumber,
      isActive: true,
    });

    // Calculate trial end date
    const trialEndDate = addDays(new Date(), TRIAL_PERIOD_DAYS);

    // Create tenant with trial subscription
    const tenant = new Tenant({
      name: data.tenantName || `${data.firstName} ${data.lastName}'s Space`,
      ownerId: user._id,
      email: data.email,
      website: data.tenantName?.replace(/\s+/g, '').toLocaleLowerCase(),
      type:
        data.tenantType ||
        (data.role === UserRole.INSTITUTION ? 'INSTITUTION' : 'INDEPENDENT_CREATOR'),
      subscription: {
        status: SubscriptionStatus.TRIAL,
        startDate: new Date(),
        endDate: trialEndDate,
        trialEndDate,
        autoRenew: false,
      },
      isActive: true,
    });

    // Link user to tenant
    user.tenantId = tenant.id;
    await user.save({ session: session ?? null });
    await tenant.save({ session: session ?? null });

    console.log('Created tenant:', tenant);

    await createAuditLog(user.id, 'USER_REGISTRATION', 'User', user.id, {
      email: data.email,
      role: data.role,
    });

    try {
      await handleEmailEvent('user.registered', {
        to: user.email,
        data: {
          name: user.firstName,
          email: user.email,
          role: user.role,
          trialDays: TRIAL_PERIOD_DAYS,
          dashboardUrl: `${FRONTEND_URL}/dashboard`,
          trialEnd: trialEndDate.toDateString(),
          year: new Date().getFullYear(),
        },
      });
    } catch (e) {
      logger.warn('Email sending failed after registration', { error: e });
    }

    // Generate tokens
    const token = generateToken({
      userId: user.id.toString(),
      email: user.email,
      role: user.role,
      tenantId: tenant.id.toString(),
    });

    const refreshToken = generateRefreshToken({
      userId: user.id.toString(),
      email: user.email,
      role: user.role,
      tenantId: tenant.id.toString(),
    });

    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: tenant._id,
      },
      tenant: {
        id: tenant._id,
        name: tenant.name,
        type: tenant.type,
        subscription: tenant.subscription,
        website: tenant.website,
      },
      tokens: {
        accessToken: token,
        refreshToken,
      },
    };
  }

  /**
   * Register Learner (Student)
   */
  async registerLearner(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    tenantId: string;
    phoneNumber?: string;
  }) {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    const tenant = await Tenant.findById(data.tenantId);
    if (!tenant || !tenant.isActive) {
      throw new AppError('Invalid or inactive tenant', 404);
    }

    // Check if tenant subscription is active
    if (
      tenant.subscription.status === SubscriptionStatus.EXPIRED ||
      tenant.subscription.status !== SubscriptionStatus.ACTIVE
    ) {
      throw new AppError('This institution/provider is not currently accepting new students', 403);
    }

    const user = await User.create({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      role: UserRole.STUDENT,
      phoneNumber: data.phoneNumber,
      tenantId: tenant._id,
      isActive: true,
    });

    await createAuditLog(user.id, 'LEARNER_REGISTRATION', 'User', user.id, {
      email: data.email,
      tenantId: data.tenantId,
    });

    try {
      await handleEmailEvent('user.registered', {
        to: user.email,
        data: {
          name: user.firstName,
          email: user.email,
          role: user.role,
          dashboardUrl: `${FRONTEND_URL}/dashboard`,
          year: new Date().getFullYear(),
        },
      });
    } catch (e) {
      logger.warn('Email sending failed after registration', { error: e });
    }

    // Generate tokens
    const token = generateToken({
      userId: user.id.toString(),
      email: user.email,
      role: user.role,
      tenantId: tenant.id.toString(),
    });

    const refreshToken = generateRefreshToken({
      userId: user.id.toString(),
      email: user.email,
      role: user.role,
      tenantId: tenant.id.toString(),
    });

    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: tenant._id,
      },
      tenant: {
        id: tenant._id,
        name: tenant.name,
        type: tenant.type,
        subscription: tenant.subscription,
      },
      tokens: {
        accessToken: token,
        refreshToken,
      },
    };
  }

  updateUserDetails(data: {
    userId: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    avatar?: string;
  }) {
    return User.findByIdAndUpdate(
      data.userId,
      {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.phoneNumber && { phone: data.phoneNumber }),
        ...(data.avatar && { avatar: data.avatar }),
      },
      { new: true }
    ).select('-password');
  }

  /**
   * User Login
   */
  async login(email: string, password: string, ipAddress?: string, userAgent?: string) {
    // Find user with password field
    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.isActive) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if tenant exists
    let tenant = null;
    if (user.tenantId) {
      tenant = await Tenant.findById(user.tenantId);

      // Check if tenant is active
      if (tenant && !tenant.isActive) {
        throw new AppError('Your account has been suspended. Please contact support.', 403);
      }
    }

    // Create audit log
    await createAuditLog(
      user.id,
      'USER_LOGIN',
      'User',
      user.id,
      { email },
      tenant?.id,
      ipAddress,
      userAgent
    );

    // Generate tokens
    const token = generateToken({
      userId: user.id.toString(),
      email: user.email,
      role: user.role,
      tenantId: tenant?.id.toString(),
    });

    const refreshToken = generateRefreshToken({
      userId: user.id.toString(),
      email: user.email,
      role: user.role,
      tenantId: tenant?.id.toString(),
    });

    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: tenant?._id,
        avatar: user.avatar,
      },
      tenant: tenant
        ? {
            id: tenant._id,
            website: tenant?.website ? tenant.website[0] : null,
            name: tenant.name,
            type: tenant.type,
            logo: tenant.logo,
            subscription: tenant.subscription,
          }
        : null,
      tokens: {
        accessToken: token,
        refreshToken,
      },
    };
  }

  /**
   * Refresh Token
   */
  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Check if the user is still active
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new AppError('User no longer active', 401);
      }

      // Generate new access token
      const newAccessToken = generateToken({
        userId: user.id.toString(),
        email: user.email,
        role: user.role,
        tenantId: decoded.tenantId ?? '',
      });

      return {
        accessToken: newAccessToken,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      };
    } catch (error: unknown) {
      console.error('Token refresh failed:', error);
      throw new AppError('Invalid or expired refresh token', 401);
    }
  }

  /**
   * Get Current User Profile
   */
  // async getCurrentUser(userId: string) {
  //   const user = await User.findById(userId).select('-password').populate('tenantId').lean();

  //   if (!user) {
  //     throw new AppError('User not found', 404);
  //   }

  //   // Get additional stats based on role
  //   let additionalData: any = {};

  //   if (user.role === UserRole.STUDENT) {
  //     const Enrollment = (await import('../models/Enrollment')).Enrollment;
  //     const enrollmentCount = await Enrollment.countDocuments({
  //       learnerId: user._id,
  //       isActive: true,
  //     });

  //     additionalData.enrollmentCount = enrollmentCount;
  //   } else if (
  // user.role === UserRole.INSTITUTION || user.role === UserRole.INDEPENDENT_CREATOR) {
  //     const Course = (await import('../models/Course')).Course;
  //     const courseCount = await Course.countDocuments({
  //       creatorId: user._id,
  //       isActive: true,
  //     });

  //     additionalData.courseCount = courseCount;
  //   }

  //   return {
  //     ...user,
  //     ...additionalData,
  //   };
  // }

  /**
   * Change Password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    user.password = newPassword;
    await user.save();

    await createAuditLog(user.id, 'PASSWORD_CHANGED', 'User', user.id, {});

    // Send notification email
    try {
      await handleEmailEvent('user.passwordReset', {
        to: user.email,
        data: {
          name: user.firstName,
          resetLink: `${FRONTEND_URL}/reset-password?token=`,
        },
      });
    } catch (e) {
      logger.warn('Failed to send password change email', { error: e });
    }

    return { message: 'Password changed successfully' };
  }

  /**
   * Password Reset Request
   */
  async requestPasswordReset(email: string) {
    const user = await User.findOne({ email });
    if (!user) {
      // Hide existence of email
      return { message: 'If the email exists, a reset link will be sent' };
    }

    //TODO: Generate reset token (in production, store in database with expiration)
    generateToken({
      userId: user.id.toString(),
      email: user.email,
      role: user.role,
    });

    await createAuditLog(user.id, 'PASSWORD_RESET_REQUESTED', 'User', user.id, {});

    try {
      await handleEmailEvent('user.passwordReset', {
        to: user.email,
        data: {
          name: user.firstName,
          resetLink: `${FRONTEND_URL}/reset-password?token=`,
        },
      });
    } catch (e) {
      logger.warn('Failed to send password change email', { error: e });
    }
    return { message: 'If the email exists, a reset link will be sent' };
  }

  /**
   * Update User Profile
   */
  async updateProfile(
    userId: string,
    updateData: {
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      avatar?: string;
    }
  ) {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Update allowed fields
    if (updateData.firstName) user.firstName = updateData.firstName;
    if (updateData.lastName) user.lastName = updateData.lastName;
    if (updateData.phoneNumber !== undefined) user.phone = updateData.phoneNumber;
    if (updateData.avatar) user.avatar = updateData.avatar;

    await user.save();

    await createAuditLog(user.id, 'PROFILE_UPDATED', 'User', user.id, updateData);

    await handleEmailEvent('user.subscriptionChanged', {
      to: user.email,
      data: {
        name: user.firstName,
        status: 'upgraded',
        plan: 'Annual',
        startDate: '2025-11-13',
        endDate: '2026-11-13',
      },
    });

    return {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phone,
      avatar: user.avatar,
      role: user.role,
    };
  }
}

// import { User } from '../models/User.ts';
// import { Tenant } from '../models/Tenant.ts';
// import { UserRole, SubscriptionStatus } from '../interfaces/index.ts';
// import { AppError } from '../utils/AppError.ts';
// import {
//   generateToken,
//   generateRefreshToken,
//   verifyRefreshToken,
// } from '../utils/jwt.ts';
// import { addDays } from '../utils/date.ts';
// import { TRIAL_PERIOD_DAYS } from '../config/constants.ts';
// import { sendEmail } from '../config/email.ts';
// import { createAuditLog } from '../utils/audit.ts';

// export class AuthService {
//   /**
//    * Register Institution or Independent User with Trial
//    */
//   async registerInstitutionOrIndependent(data: {
//     email: string;
//     password: string;
//     firstName: string;
//     lastName: string;
//     role: UserRole;
//     phoneNumber?: string;
//     tenantName?: string;
//     tenantType?: 'institution' | 'independent_user';
//   }) {
//     // Check if email already exists
//     const existingUser = await User.findOne({ email: data.email });
//     if (existingUser) {
//       throw new AppError('Email already registered', 409);
//     }

//     // Validate role
//     if (
//       data.role !== UserRole.INSTITUTION &&
//       data.role !== UserRole.INDEPENDENT_CREATOR
//     ) {
//       throw new AppError('Invalid role for this registration', 400);
//     }

//     // Create user
//     const user = await User.create({
//       email: data.email,
//       password: data.password,
//       firstName: data.firstName,
//       lastName: data.lastName,
//       role: data.role,
//       phoneNumber: data.phoneNumber,
//       isActive: true,
//     });

//     // Calculate trial end date (60 days)
//     const trialEndDate = addDays(new Date(), TRIAL_PERIOD_DAYS);

//     // Create tenant with trial subscription
//     const tenant = await Tenant.create({
//       name: data.tenantName || `${data.firstName} ${data.lastName}'s Space`,
//       ownerId: user._id,
//       type:
//         data.tenantType ||
//         (data.role === UserRole.INSTITUTION
//           ? 'institution'
//           : 'independent_user'),
//       subscription: {
//         status: SubscriptionStatus.TRIAL,
//         startDate: new Date(),
//         endDate: trialEndDate,
//         trialEndDate: trialEndDate,
//         autoRenew: false,
//       },
//       isActive: true,
//     });

//     // Link user to tenant
//     user.tenantId = tenant.id;
//     await user.save();

//     // Create audit log
//     await createAuditLog(user.id, 'USER_REGISTRATION', 'User', user.id, {
//       email: data.email,
//       role: data.role,
//     });

//     // Send welcome email
//     await sendEmail(
//       user.email,
//       'Welcome to Tutera LMS',
//       `<h1>Welcome ${user.firstName}!</h1>
//       <p>Your account has been created successfully.</p>
//       <p>You have ${TRIAL_PERIOD_DAYS} days of free trial.</p>
//       <p>Trial expires on: ${trialEndDate.toDateString()}</p>`
//     );

//     // Generate tokens
//     const token = generateToken({
//       userId: user.id.toString(),
//       email: user.email,
//       role: user.role,
//       tenantId: tenant.id.toString() ?? '',
//     });

//     const refreshToken = generateRefreshToken({
//       userId: user.id.toString(),
//       email: user.email,
//       role: user.role,
//       tenantId: tenant.id.toString(),
//     });

//     return {
//       user: {
//         id: user._id,
//         email: user.email,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         role: user.role,
//         tenantId: tenant._id,
//       },
//       tenant: {
//         id: tenant._id,
//         name: tenant.name,
//         type: tenant.type,
//         subscription: tenant.subscription,
//       },
//       tokens: {
//         accessToken: token,
//         refreshToken,
//       },
//     };
//   }

//   /**
//    * Register Learner (Student) under Institution/Independent User
//    */
//   async registerLearner(data: {
//     email: string;
//     password: string;
//     firstName: string;
//     lastName: string;
//     tenantId: string;
//     phoneNumber?: string;
//   }) {
//     // Check if email already exists
//     const existingUser = await User.findOne({ email: data.email });
//     if (existingUser) {
//       throw new AppError('Email already registered', 409);
//     }

//     // Verify tenant exists and is active
//     const tenant = await Tenant.findById(data.tenantId);
//     if (!tenant || !tenant.isActive) {
//       throw new AppError('Invalid or inactive institution/provider', 404);
//     }

//     // Check if tenant subscription is active
//     if (
//       tenant.subscription.status === SubscriptionStatus.EXPIRED ||
//       tenant.subscription.status === SubscriptionStatus.ACTIVE
//     ) {
//       throw new AppError(
//         'This institution/provider is not currently accepting new students',
//         403
//       );
//     }

//     // Create learner
//     const user = await User.create({
//       email: data.email,
//       password: data.password,
//       firstName: data.firstName,
//       lastName: data.lastName,
//       role: UserRole.STUDENT,
//       phoneNumber: data.phoneNumber,
//       tenantId: tenant._id,
//       isActive: true,
//     });

//     // Create audit log
//     await createAuditLog(user.id, 'LEARNER_REGISTRATION', 'User', user.id, {
//       email: data.email,
//       tenantId: data.tenantId,
//     });

//     // Send welcome email
//     await sendEmail(
//       user.email,
//       'Welcome to Tutera LMS',
//       `<h1>Welcome ${user.firstName}!</h1>
//       <p>Your learner account has been created successfully under ${tenant.name}.</p>
//       <p>You can now browse and enroll in courses.</p>`
//     );

//     // Generate tokens
//     const token = generateToken({
//       userId: user.id.toString(),
//       email: user.email,
//       role: user.role,
//       tenantId: tenant.id.toString(),
//     });

//     const refreshToken = generateRefreshToken({
//       userId: user.id.toString(),
//       email: user.email,
//       role: user.role,
//       tenantId: tenant.id.toString(),
//     });

//     return {
//       user: {
//         id: user._id,
//         email: user.email,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         role: user.role,
//         tenantId: tenant._id,
//       },
//       tokens: {
//         accessToken: token,
//         refreshToken,
//       },
//     };
//   }

//   /**
//    * User Login
//    */
//   async login(
//     email: string,
//     password: string,
//     ipAddress?: string,
//     userAgent?: string
//   ) {
//     // Find user with password field
//     const user = await User.findOne({ email }).select('+password');

//     if (!user || !user.isActive) {
//       throw new AppError('Invalid credentials', 401);
//     }

//     // Verify password
//     const isPasswordValid = await user.comparePassword(password);
//     if (!isPasswordValid) {
//       throw new AppError('Invalid credentials', 401);
//     }

//     // Get tenant if exists
//     let tenant = null;
//     if (user.tenantId) {
//       tenant = await Tenant.findById(user.tenantId);

//       // Check if tenant is active
//       if (tenant && !tenant.isActive) {
//         throw new AppError(
//           'Your account has been suspended. Please contact support.',
//           403
//         );
//       }
//     }

//     // Create audit log
//     await createAuditLog(
//       user.id,
//       'USER_LOGIN',
//       'User',
//       user.id,
//       { email },
//       tenant?.id,
//       ipAddress,
//       userAgent
//     );

//     // Generate tokens
//     const token = generateToken({
//       userId: user.id.toString(),
//       email: user.email,
//       role: user.role,
//       tenantId: tenant?.id.toString(),
//     });

//     const refreshToken = generateRefreshToken({
//       userId: user.id.toString(),
//       email: user.email,
//       role: user.role,
//       tenantId: tenant?.id.toString(),
//     });

//     return {
//       user: {
//         id: user._id,
//         email: user.email,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         role: user.role,
//         tenantId: tenant?._id,
//         avatar: user.avatar,
//       },
//       tenant: tenant
//         ? {
//             id: tenant._id,
//             name: tenant.name,
//             type: tenant.type,
//             logo: tenant.logo,
//             subscription: tenant.subscription,
//           }
//         : null,
//       tokens: {
//         accessToken: token,
//         refreshToken,
//       },
//     };
//   }

//   /**
//    * Refresh Access Token
//    */
//   async refreshToken(refreshToken: string) {
//     if (!refreshToken) {
//       throw new AppError('Refresh token is required', 400);
//     }

//     try {
//       // Verify refresh token
//       const decoded = verifyRefreshToken(refreshToken);

//       // Check if user still exists and is active
//       const user = await User.findById(decoded.userId);
//       if (!user || !user.isActive) {
//         throw new AppError('Invalid refresh token', 401);
//       }

//       // Generate new access token
//       const newAccessToken = generateToken({
//         userId: user.id.toString(),
//         email: user.email,
//         role: user.role,
//         tenantId: decoded.tenantId ?? '',
//       });

//       return {
//         accessToken: newAccessToken,
//         user: {
//           id: user._id,
//           email: user.email,
//           firstName: user.firstName,
//           lastName: user.lastName,
//           role: user.role,
//         },
//       };
//     } catch (error: unknown) {
//       console.error('Token refresh failed:', error);
//       throw new AppError('Invalid or expired refresh token', 401);
//     }
//   }

//   /**
//    * Get Current User Profile
//    */
//   // async getCurrentUser(userId: string) {
//   //   const user = await User.findById(userId)
//   //     .select('-password')
//   //     .populate('tenantId')
//   //     .lean();

//   //   if (!user) {
//   //     throw new AppError('User not found', 404);
//   //   }

//   //   // Get additional stats based on role
//   //   let additionalData: any = {};

//   //   if (user.role === UserRole.STUDENT) {
//   //     const Enrollment = (await import('../models/Enrollment')).Enrollment;
//   //     const enrollmentCount = await Enrollment.countDocuments({
//   //       learnerId: user._id,
//   //       isActive: true,
//   //     });

//   //     additionalData.enrollmentCount = enrollmentCount;
//   } else if (user.role === UserRole.INSTITUTION || user.role === UserRole.INDEPENDENT_CREATOR) {
//   //     const Course = (await import('../models/Course')).Course;
//   //     const courseCount = await Course.countDocuments({
//   //       creatorId: user._id,
//   //       isActive: true,
//   //     });

//   //     additionalData.courseCount = courseCount;
//   //   }

//   //   return {
//   //     ...user,
//   //     ...additionalData,
//   //   };
//   // }

//   /**
//    * Change Password
//    */
//   async changePassword(
//     userId: string,
//     currentPassword: string,
//     newPassword: string
//   ) {
//     const user = await User.findById(userId).select('+password');

//     if (!user) {
//       throw new AppError('User not found', 404);
//     }

//     // Verify current password
//     const isPasswordValid = await user.comparePassword(currentPassword);
//     if (!isPasswordValid) {
//       throw new AppError('Current password is incorrect', 401);
//     }

//     // Update password
//     user.password = newPassword;
//     await user.save();

//     await createAuditLog(user.id, 'PASSWORD_CHANGED', 'User', user.id, {});

//     // Send notification email
//     await sendEmail(
//       user.email,
//       'Password Changed',
//       `<h1>Password Changed Successfully</h1>
//       <p>Your password has been changed.</p>
//       <p>If you did not make this change, please contact support immediately.</p>`
//     );

//     return { message: 'Password changed successfully' };
//   }

//   /**
//    * Request Password Reset
//    */
//   async requestPasswordReset(email: string) {
//     const user = await User.findOne({ email });

//     if (!user) {
//       // Don't reveal if email exists
//       return { message: 'If the email exists, a reset link will be sent' };
//     }

//     // Generate reset token (in production, store in database with expiration)
//     const resetToken = generateToken({
//       userId: user.id.toString(),
//       email: user.email,
//       role: user.role,
//     });

//     await createAuditLog(
//       user.id,
//       'PASSWORD_RESET_REQUESTED',
//       'User',
//       user.id,
//       {}
//     );

//     // Send reset email
//     await sendEmail(
//       user.email,
//       'Password Reset Request',
//       `<h1>Password Reset</h1>
//       <p>Click the link below to reset your password:</p>
//       <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">Reset Password</a>
//       <p>This link will expire in 1 hour.</p>
//       <p>If you didn't request this, please ignore this email.</p>`
//     );

//     return { message: 'If the email exists, a reset link will be sent' };
//   }

//   /**
//    * Update User Profile
//    */
//   async updateProfile(
//     userId: string,
//     updateData: {
//       firstName?: string;
//       lastName?: string;
//       phoneNumber?: string;
//       avatar?: string;
//     }
//   ) {
//     const user = await User.findById(userId);

//     if (!user) {
//       throw new AppError('User not found', 404);
//     }

//     // Update allowed fields
//     if (updateData.firstName) user.firstName = updateData.firstName;
//     if (updateData.lastName) user.lastName = updateData.lastName;
//     if (updateData.phoneNumber !== undefined)
//       user.phone = updateData.phoneNumber;
//     if (updateData.avatar) user.avatar = updateData.avatar;

//     await user.save();

//     await createAuditLog(
//       user.id,
//       'PROFILE_UPDATED',
//       'User',
//       user.id,
//       updateData
//     );

//     return {
//       id: user.id,
//       email: user.email,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       phoneNumber: user.phone,
//       avatar: user.avatar,
//       role: user.role,
//     };
//   }
// }
