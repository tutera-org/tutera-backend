import type { Response } from 'express';

export class ApiResponse {
  static success(
    res: Response,
    data: unknown,
    message: string = 'Success',
    statusCode: number = 200
  ): void {
    res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(res: Response, message: string, statusCode: number = 500, errors?: unknown[]): void {
    res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }

  static paginated(
    res: Response,
    data: unknown[],
    page: number,
    limit: number,
    total: number,
    message: string = 'Success'
  ): void {
    res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  }
}
