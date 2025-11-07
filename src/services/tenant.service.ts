import { Types } from 'mongoose';
import { Tenant } from '../models/Tenant.ts';
import { AppError } from '../utils/AppError.ts';
import { createAuditLog } from '../utils/audit.ts';

export class TenantService {
  async getTenantById(tenantId: string) {
    const tenant = await Tenant.findById(tenantId)
      .populate('ownerId', 'firstName lastName email')
      .lean();

    if (!tenant) {
      throw new AppError('Tenant not found', 404);
    }

    return tenant;
  }

  async getTenantsByFilter(
    filter: Record<string, unknown>,
    page: number = 1,
    limit: number = 20
  ) {
    const skip = (page - 1) * limit;

    const [tenants, total] = await Promise.all([
      Tenant.find(filter)
        .populate('ownerId', 'firstName lastName email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      Tenant.countDocuments(filter),
    ]);

    return {
      tenants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateTenant(tenantId: string, userId: string, updateData: unknown) {
    const tenant = await Tenant.findById(tenantId);

    if (!tenant) {
      throw new AppError('Tenant not found', 404);
    }

    if (tenant.ownerId.toString() !== userId) {
      throw new AppError('Unauthorized to update this tenant', 403);
    }

    Object.assign(tenant, updateData);
    await tenant.save();

    await createAuditLog(
      new Types.ObjectId(userId),
      'TENANT_UPDATE',
      'Tenant',
      tenant.id,
      updateData as Record<string, unknown>,
      tenant.id
    );

    return tenant;
  }
}
