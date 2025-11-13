import type { Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service.ts';
import { ApiResponse } from '../utils/ApiResponse.ts';
import type { AuthRequest } from '../interfaces/index.ts';

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, role, isActive } = req.query;
      const filter: Record<string, unknown> = {};
      if (role) filter.role = role;
      if (isActive !== undefined) filter.isActive = isActive === 'true';

      const result = await this.adminService.getAllUsers(filter, {
        page: Number(page),
        limit: Number(limit),
      });

      ApiResponse.paginated(
        res,
        result.users,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total,
        'Users retrieved'
      );
    } catch (error) {
      next(error);
    }
  };

  //   getUserById = async (
  //     req: AuthRequest,
  //     res: Response,
  //     next: NextFunction
  //   ): Promise<void> => {
  //     try {
  //       const user = await this.adminService.getUserById(req.params.id);
  //       ApiResponse.success(res, user, 'User retrieved');
  //     } catch (error) {
  //       next(error);
  //     }
  //   };

  suspendUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { reason } = req.body;
      const user = await this.adminService.suspendUser(
        req.params.id as string,
        req.user!.userId,
        reason
      );
      ApiResponse.success(res, user, 'User suspended');
    } catch (error) {
      next(error);
    }
  };

  activateUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.adminService.activateUser(req.params.id as string, req.user!.userId);
      ApiResponse.success(res, user, 'User activated');
    } catch (error) {
      next(error);
    }
  };

  getAllTenants = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, type, subscriptionStatus } = req.query;
      const filter: Record<string, unknown> = {};
      if (type) filter.type = type;
      if (subscriptionStatus) filter['subscription.status'] = subscriptionStatus;

      const result = await this.adminService.getAllTenants(filter, {
        page: Number(page),
        limit: Number(limit),
      });

      ApiResponse.paginated(
        res,
        result.tenants,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total,
        'Tenants retrieved'
      );
    } catch (error) {
      next(error);
    }
  };

  suspendTenant = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { reason } = req.body;
      const tenant = await this.adminService.suspendTenant(
        req.params.id as string,
        req.user!.userId,
        reason
      );
      ApiResponse.success(res, tenant, 'Tenant suspended');
    } catch (error) {
      next(error);
    }
  };

  activateTenant = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenant = await this.adminService.activateTenant(
        req.params.id as string,
        req.user!.userId
      );
      ApiResponse.success(res, tenant, 'Tenant activated');
    } catch (error) {
      next(error);
    }
  };

  getAuditLogs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, action, resource, userId, tenantId } = req.query;
      const filter: Record<string, unknown> = {};
      if (action) filter.action = action;
      if (resource) filter.resource = resource;
      if (userId) filter.userId = userId;
      if (tenantId) filter.tenantId = tenantId;

      const result = await this.adminService.getAuditLogs(filter, {
        page: Number(page),
        limit: Number(limit),
      });

      ApiResponse.paginated(
        res,
        result.logs,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total,
        'Audit logs retrieved'
      );
    } catch (error) {
      next(error);
    }
  };
}

export default new AdminController();
