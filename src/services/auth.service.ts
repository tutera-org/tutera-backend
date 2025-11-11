import { User } from '../models/User.ts';
import { Tenant } from '../models/Tenant.ts';
import { UserRole, SubscriptionStatus } from '../interfaces/index.ts';
import { AppError } from '../utils/AppError.ts';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.ts';
import { addDays } from '../utils/date.ts';
import { TRIAL_PERIOD_DAYS } from '../config/constants.ts';
// import { sendEmail } from '../config/email.ts';
import { createAuditLog } from '../utils/audit.ts';
import type { ClientSession } from 'mongoose';

export class AuthService {
  /**
   * Register Institution or Independent User with Trial
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

    console.log('Creating user:', user);

    // Calculate trial end date (60 days)
    const trialEndDate = addDays(new Date(), TRIAL_PERIOD_DAYS);

    // Create tenant with trial subscription
    const tenant = new Tenant({
      name: data.tenantName || `${data.firstName}-${data.lastName}-Space`,
      ownerId: user._id,
      email: data.email,
      type:
        data.tenantType ||
        (data.role === UserRole.INSTITUTION ? 'INSTITUTION' : 'INDEPENDENT_CREATOR'),
      subscription: {
        status: SubscriptionStatus.TRIAL,
        startDate: new Date(),
        endDate: trialEndDate,
        trialEndDate: trialEndDate,
        autoRenew: false,
      },
      isActive: true,
    });

    // Link user to tenant
    user.tenantId = tenant.id;
    await user.save({ session: session ?? null });
    await tenant.save({ session: session ?? null });

    console.log('Created tenant:', tenant);

    // Create audit log
    await createAuditLog(user.id, 'USER_REGISTRATION', 'User', user.id, {
      email: data.email,
      role: data.role,
    });

    // Send welcome email
    // await sendEmail(
    //   user.email,
    //   'Welcome to Tutera LMS',
    //   `<h1>Welcome ${user.firstName}!</h1>
    //   <p>Your account has been created successfully.</p>
    //   <p>You have ${TRIAL_PERIOD_DAYS} days of free trial.</p>
    //   <p>Trial expires on: ${trialEndDate.toDateString()}</p>`
    // );

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

  /**
   * Register Learner (Student) under Institution/Independent User
   */
  async registerLearner(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    tenantId: string;
    phoneNumber?: string;
  }) {
    // Check if email already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Verify tenant exists and is active
    const tenant = await Tenant.findById(data.tenantId);
    if (!tenant || !tenant.isActive) {
      throw new AppError('Invalid or inactive institution/provider', 404);
    }

    // Check if tenant subscription is active
    if (
      tenant.subscription.status === SubscriptionStatus.EXPIRED ||
      tenant.subscription.status === SubscriptionStatus.ACTIVE
    ) {
      throw new AppError('This institution/provider is not currently accepting new students', 403);
    }

    // Create learner
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

    // Create audit log
    await createAuditLog(user.id, 'LEARNER_REGISTRATION', 'User', user.id, {
      email: data.email,
      tenantId: data.tenantId,
    });

    // TODO: Send welcome email
    // await sendEmail(
    //   user.email,
    //   'Welcome to Tutera LMS',
    //   `<h1>Welcome ${user.firstName}!</h1>
    //   <p>Your learner account has been created successfully under ${tenant.name}.</p>
    //   <p>You can now browse and enroll in courses.</p>`
    // );

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
      tokens: {
        accessToken: token,
        refreshToken,
      },
    };
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

    // Get tenant if exists
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
   * Refresh Access Token
   */
  async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Check if user still exists and is active
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new AppError('Invalid refresh token', 401);
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

    // Update password
    user.password = newPassword;
    await user.save();

    await createAuditLog(user.id, 'PASSWORD_CHANGED', 'User', user.id, {});

    //TODO: Send notification email
    // await sendEmail(
    //   user.email,
    //   'Password Changed',
    //   `<h1>Password Changed Successfully</h1>
    //   <p>Your password has been changed.</p>
    //   <p>If you did not make this change, please contact support immediately.</p>`
    // );

    return { message: 'Password changed successfully' };
  }

  /**
   * Request Password Reset
   */
  async requestPasswordReset(email: string) {
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if email exists
      return { message: 'If the email exists, a reset link will be sent' };
    }

    //TODO: Generate reset token (in production, store in database with expiration)
    generateToken({
      userId: user.id.toString(),
      email: user.email,
      role: user.role,
    });

    await createAuditLog(user.id, 'PASSWORD_RESET_REQUESTED', 'User', user.id, {});

    // TODO: Send reset email
    // await sendEmail(
    //   user.email,
    //   'Password Reset Request',
    //   `<h1>Password Reset</h1>
    //   <p>Click the link below to reset your password:</p>
    //   <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">Reset Password</a>
    //   <p>This link will expire in 1 hour.</p>
    //   <p>If you didn't request this, please ignore this email.</p>`
    // );

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

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phone,
      avatar: user.avatar,
      role: user.role,
    };
  }
}
