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
        return; // Return void after sending response
      }
      next(err);
    }
  };

/**
 * Express middleware factory function that creates a parameter validator using Zod schema.
 * @param schema - The Zod schema to validate request parameters against
 * @returns {RequestHandler} Express middleware that validates request parameters
 *
 * @throws {ZodError} When request parameter validation fails
 *
 * @example
 * ```typescript
 * const paramsSchema = z.object({
 *   params: z.object({
 *     id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format')
 *   })
 * });
 *
 * app.get('/users/:id', ParamsValidator(paramsSchema), (req, res) => {
 *   // Handle validated request
 * });
 * ```
 */
export const ParamsValidator =
  (schema: ZodType<unknown>): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse({ params: req.params }) as { params: typeof req.params };
      req.params = parsed.params;
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
        return; // Return void after sending response
      }
      next(err);
    }
  };
