import type { Response } from 'express';

export class ApiResponse {
  static success<T>(res: Response, data: T, message = 'Success', statusCode = 200): void {
    res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static successNoData(res: Response, message = 'Success', statusCode = 200): void {
    res.status(statusCode).json({
      success: true,
      message,
    });
  }

  static error(res: Response, message: string, statusCode: number = 500, errors?: unknown[]): void {
    res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }

  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message = 'Success'
  ): void {
    const totalPages = Math.ceil(total / limit);
    res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  }
}

// import type { Response } from 'express';

// export class ApiResponse {
//   static success(
//     res: Response,
//     data: unknown,
//     message: string = 'Success',
//     statusCode: number = 200
//   ): void {
//     res.status(statusCode).json({
//       success: true,
//       message,
//       data,
//     });
//   }

//   static error(
//     res: Response,
//     message: string,
//     statusCode: number = 500,
//     errors?: unknown[]
//   ): void {
//     res.status(statusCode).json({
//       success: false,
//       message,
//       errors,
//     });
//   }

//   static paginated(
//     res: Response,
//     data: unknown[],
//     page: number,
//     limit: number,
//     total: number,
//     message: string = 'Success'
//   ): void {
//     res.status(200).json({
//       success: true,
//       message,
//       data,
//       pagination: {
//         page,
//         limit,
//         total,
//         totalPages: Math.ceil(total / limit),
//         hasNextPage: page < Math.ceil(total / limit),
//         hasPrevPage: page > 1,
//       },
//     });
//   }
// }
