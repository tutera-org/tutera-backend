import { Types } from 'mongoose';
import { User } from '../models/User.ts';
import { Tenant } from '../models/Tenant.ts';
import { AuditLog } from '../models/AuditLog.ts';
import { AppError } from '../utils/AppError.ts';
import { SubscriptionStatus, UserRole } from '../interfaces/index.ts';
import { createAuditLog } from '../utils/audit.ts';
import { handleEmailEvent } from '../config/email/emailEvent.ts';
import { paginate, type PaginationOptions } from '../utils/pagination.ts';
import { buildMongoFilter } from '../utils/queryFilterBuilder.ts';

export class AdminService {
  // User Management
  async getAllUsers(filter: Record<string, unknown>, options: Partial<PaginationOptions>) {
    const query = buildMongoFilter(filter);

    const users = await paginate(
      User,
      options.page,
      options.limit,
      '-password',
      'tenantId:name type',
      query,
      options.sortBy,
      options.sortOrder
    );
    return {
      users: users.data,
      pagination: {
        page: users.page,
        limit: users.limit,
        total: users.total,
        totalPages: users.totalPages,
      },
    };
  }

  // async getUserById(userId: string) {
  //   const user = await User.findById(userId)
  //     .select('-password')
  //     .populate('tenantId')
  //     .lean();

  //   if (!user) {
  //     throw new AppError('User not found', 404);
  //   }

  // // Get additional stats
  //  let stats = {};

  //   if (user.role === UserRole.STUDENT) {
  //     const [enrollmentCount, totalSpent] = await Promise.all([
  //       Enrollment.countDocuments({ learnerId: user._id, isActive: true }),
  //       Payment.aggregate([
  //         {
  //           $match: {
  //             userId: user._id,
  //             status: 'completed',
  //             paymentType: 'course',
  //           },
  //         },
  //         { $group: { _id: null, total: { $sum: '$amount' } } },
  //       ]),
  //     ]);

  //     stats = {
  //       enrollmentCount,
  //       totalSpent: totalSpent[0]?.total || 0,
  //     };
  //   } else if (
  //     user.role === UserRole.INSTITUTION ||
  //     user.role === UserRole.INDEPENDENT_CREATOR
  //   ) {
  //     const [courseCount, totalRevenue, studentCount] = await Promise.all([
  //       Course.countDocuments({ creatorId: user._id, isActive: true }),
  //       Payment.aggregate([
  //         {
  //           $match: {
  //             tenantId: user.tenantId,
  //             status: 'completed',
  //             paymentType: 'course',
  //           },
  //         },
  //         { $group: { _id: null, total: { $sum: '$amount' } } },
  //       ]),
  //       Enrollment.distinct('learnerId', { tenantId: user.tenantId, isActive: true }),
  //     ]);

  //     stats = {
  //       courseCount,
  //       totalRevenue: totalRevenue[0]?.total || 0,
  //       studentCount: studentCount.length,
  //     };
  //   }

  //   return {
  //     ...user,
  //     stats,
  //   };
  // }

  async suspendUser(userId: string, adminId: string, reason: string) {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      throw new AppError('Cannot suspend super admin', 400);
    }

    user.isActive = false;
    await user.save();

    await createAuditLog(
      new Types.ObjectId(adminId),
      'USER_SUSPENDED',
      'User',
      user.id,
      { reason },
      user.tenantId
    );

    // TODO: send suspension email
    // await sendEmail(
    //   user.email,
    //   'Account Suspended',
    //   `<h1>Account Suspended</h1>
    //   <p>Your account has been suspended.</p>
    //   <p>Reason: ${reason}</p>
    //   <p>Please contact support for more information.</p>`
    // );

    return user;
  }

  async activateUser(userId: string, adminId: string) {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.isActive = true;
    await user.save();

    await createAuditLog(
      new Types.ObjectId(adminId),
      'USER_ACTIVATED',
      'User',
      user.id,
      {},
      user.tenantId
    );

    // TODO: Send activation email
    // await sendEmail(
    //   user.email,
    //   'Account Activated',
    //   `<h1>Account Activated</h1>
    //   <p>Your account has been reactivated.</p>
    //   <p>You can now access all features.</p>`
    // );

    return user;
  }

  // Tenant Management
  async getAllTenants(filter: Record<string, unknown> = {}, options: Partial<PaginationOptions>) {
    const query = buildMongoFilter(filter);

    const tenants = await paginate(
      Tenant,
      options.page,
      options.limit,
      undefined,
      'ownerId:firstName lastName email',
      query,
      options.sortBy,
      options.sortOrder
    );
    // const [tenants, total] = await Promise.all([
    //   Tenant.find(filter)
    //     .populate('ownerId', 'firstName lastName email')
    //     .sort(sort)
    //     .skip(skip)
    //     .limit(limitNum)
    //     .lean(),
    //   Tenant.countDocuments(filter),
    // ]);

    return {
      tenants: tenants.data,
      pagination: {
        page: tenants.page,
        limit: tenants.limit,
        total: tenants.total,
        totalPages: tenants.totalPages,
      },
    };
  }

  async suspendTenant(tenantId: string, adminId: string, reason: string) {
    const tenant = await Tenant.findById(tenantId);

    if (!tenant) {
      throw new AppError('Tenant not found', 404);
    }

    tenant.isActive = false;
    tenant.subscription.status = SubscriptionStatus.TRIAL;
    tenant.violations.count += 1;
    tenant.violations.lastViolationDate = new Date();
    tenant.violations.reasons.push(reason);
    await tenant.save();

    await createAuditLog(
      new Types.ObjectId(adminId),
      'TENANT_SUSPENDED',
      'Tenant',
      tenant.id,
      { reason },
      tenant.id
    );

    const owner = await User.findById(tenant.ownerId);
    if (owner) {
      await handleEmailEvent('admin.alert', {
        to: 'admin@tutera.com',
        data: {
          userEmail: 'suspicious@domain.com',
          ipAddress: '192.168.1.10',
          time: new Date().toISOString(),
        },
      });
    }

    return tenant;
  }

  async activateTenant(tenantId: string, adminId: string) {
    const tenant = await Tenant.findById(tenantId);

    if (!tenant) {
      throw new AppError('Tenant not found', 404);
    }

    tenant.isActive = true;
    tenant.subscription.status = SubscriptionStatus.ACTIVE;
    await tenant.save();

    await createAuditLog(
      new Types.ObjectId(adminId),
      'TENANT_ACTIVATED',
      'Tenant',
      tenant.id,
      {},
      tenant.id
    );

    const owner = await User.findById(tenant.ownerId);
    if (owner) {
      await handleEmailEvent('user.subscriptionActivation', {
        to: tenant.email,
        data: {
          firstName: tenant.name,
          subscriptionType: 'Annual',
          amount: 279.99,
          startDate: '2025-11-13',
          nextBillingDate: '2026-11-13',
          autoRenew: 'Yes',
        },
      });
    }

    return tenant;
  }

  // Audit Logs
  async getAuditLogs(
    filter: Record<string, unknown> = {},
    options: Partial<PaginationOptions> = {}
  ) {
    const query = buildMongoFilter(filter);

    const auditLogs = await paginate(
      AuditLog,
      options.page,
      options.limit,
      undefined,
      ['userId:firstName lastName email role', 'tenantId:name'],
      query,
      options.sortBy,
      options.sortOrder
    );

    // const [logs, total] = await Promise.all([
    //   AuditLog.find(filter)
    //     .populate('userId', 'firstName lastName email role')
    //     .populate('tenantId', 'name')
    //     .sort(sort)
    //     .skip(skip)
    //     .limit(limitNum)
    //     .lean(),
    //   AuditLog.countDocuments(filter),
    // ]);

    return {
      logs: auditLogs.data,
      pagination: {
        page: auditLogs.page,
        limit: auditLogs.limit,
        total: auditLogs.total,
        totalPages: auditLogs.totalPages,
      },
    };
  }

  // Platform Statistics
  // async getPlatformStatistics() {
  //   const [
  //     totalUsers,
  //     totalTenants,
  //     totalCourses,
  //     totalEnrollments,
  //     activeSubscriptions,
  //     totalRevenue,
  //     usersByRole,
  //     subscriptionsByStatus,
  //   ] = await Promise.all([
  //     User.countDocuments({ isActive: true }),
  //     Tenant.countDocuments({ isActive: true }),
  //     Course.countDocuments({ isActive: true }),
  //     Enrollment.countDocuments({ isActive: true }),
  //     Tenant.countDocuments({ 'subscription.status': SubscriptionStatus.ACTIVE }),
  //     Payment.aggregate([
  //       { $match: { status: 'completed' } },
  //       { $group: { _id: null, total: { $sum: '$amount' } } },
  //     ]),
  //     User.aggregate([
  //       { $group: { _id: '$role', count: { $sum: 1 } } },
  //     ]),
  //     Tenant.aggregate([
  //       { $group: { _id: '$subscription.status', count: { $sum: 1 } } },
  //     ]),
  //   ]);

  //   return {
  //     overview: {
  //       totalUsers,
  //       totalTenants,
  //       totalCourses,
  //       totalEnrollments,
  //       activeSubscriptions,
  //       totalRevenue: totalRevenue[0]?.total || 0,
  //     },
  //     usersByRole: usersByRole.reduce((acc: any, item: any) => {
  //       acc[item._id] = item.count;
  //       return acc;
  //     }, {}),
  //     subscriptionsByStatus: subscriptionsByStatus.reduce((acc: any, item: any) => {
  //       acc[item._id] = item.count;
  //       return acc;
  //     }, {}),
  //   };
  // }
}
