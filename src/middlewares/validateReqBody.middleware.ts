import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';

const ALLOWED_METHODS = ['POST', 'PUT', 'PATCH'] as const;

export const validateReqBody =
  <T>(schema: ZodType<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!ALLOWED_METHODS.includes(req.method as any)) {
      return next();
    }

    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'body',
        message: issue.message,
      }));

      res.status(422).json({
        success: false,
        message: 'Request body validation failed',
        errors,
      });
      return;
    }

    /**
     * Replace body with parsed data
     * (coercions, trims, defaults applied)
     */
    req.body = result.data;

    next();
  };
