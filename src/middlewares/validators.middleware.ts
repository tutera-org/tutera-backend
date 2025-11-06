import type { Response, NextFunction, RequestHandler, Request } from 'express';
import { ZodError, ZodType } from 'zod';

/**
 * Express middleware factory function that creates a request validator using Zod schema.
 * @param schema - The Zod schema to validate request body against
 * @returns {RequestHandler} Express middleware that validates request body
 *
 * @throws {ZodError} When request body validation fails
 *
 * @example
 * ```typescript
 * const userSchema = z.object({
 *   name: z.string(),
 *   email: z.string().email()
 * });
 *
 * app.post('/users', RequestValidator(userSchema), (req, res) => {
 *   // Handle validated request
 * });
 * ```
 */
export const RequestValidator =
  (schema: ZodType<unknown>): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        res.status(400).send({
          success: false,
          errors,
        });
      }
      next(err);
    }
  };
