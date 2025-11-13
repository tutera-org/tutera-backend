import type { Response, NextFunction } from 'express';
import { TenantService } from '../services/tenant.service.ts';
import { ApiResponse } from '../utils/ApiResponse.ts';
import type { AuthRequest } from '../interfaces/index.ts';

export class TenantController {
  private tenantService: TenantService;

  constructor() {
    this.tenantService = new TenantService();
  }

  getTenantById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId || req.params.id;
      const tenant = await this.tenantService.getTenantById(userId!);
      ApiResponse.success(res, tenant, 'Tenant retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  //   getPublicTenants = async (
  //     req: AuthRequest,
  //     res: Response,
  //     next: NextFunction
  //   ): Promise<void> => {
  //     try {
  //       const { page = 1, limit = 20 } = req.query;
  //       const result = await this.tenantService.getPublicTenants(
  //         Number(page),
  //         Number(limit)
  //       );
  //       ApiResponse.paginated(
  //         res,
  //         result.tenants,
  //         result.pagination.page,
  //         result.pagination.limit,
  //         result.pagination.total,
  //         'Tenants retrieved successfully'
  //       );
  //     } catch (error) {
  //       next(error);
  //     }
  //   };

  updateTenant = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenant = await this.tenantService.updateTenant(
        req.params.id as string,
        req.user!.userId,
        req.body
      );
      ApiResponse.success(res, tenant, 'Tenant updated successfully');
    } catch (error) {
      next(error);
    }
  };
}

export default new TenantController();
