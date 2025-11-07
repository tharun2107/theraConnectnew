import type { Request, Response, NextFunction } from 'express';
import { ZodError, ZodTypeAny } from 'zod';

interface SchemaParts {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

export const validate = (schemas: SchemaParts) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData: any = {};

    // Log incoming data for debugging
    console.log('[validate] Incoming request:', {
      method: req.method,
      url: req.url,
      params: req.params,
      body: req.body,
      query: req.query
    });

    if (schemas.body) {
      console.log('[validate] Validating body:', req.body);
      try {
        validatedData.body = await schemas.body.parseAsync(req.body);
        console.log('[validate] Body validation passed:', validatedData.body);
      } catch (e) {
        console.error('[validate.body][ERROR]', (e as any).issues || e);
        throw e;
      }
    }
    if (schemas.query) {
      // Debug log for query validation
      // eslint-disable-next-line no-console
      console.log('[validate] incoming query=', req.query);
      try {
        validatedData.query = await schemas.query.parseAsync(req.query as any);
      } catch (e) {
        console.error('[validate.query][ERROR]', (e as any).issues || e);
        throw e;
      }
      // eslint-disable-next-line no-console
      console.log('[validate] validated query=', validatedData.query);
    }
    if (schemas.params) {
      console.log('[validate] Validating params:', req.params);
      try {
        validatedData.params = await schemas.params.parseAsync(req.params);
        console.log('[validate] Params validation passed:', validatedData.params);
      } catch (e) {
        console.error('[validate.params][ERROR]', (e as any).issues || e);
        throw e;
      }
    }

    // Apply only body (safe to overwrite). For query/params, avoid assignment
    // because in Express 5 these are readonly accessors and reassigning throws.
    if (validatedData.body) req.body = validatedData.body;
    // Make validated values available without mutating Express objects
    // Access via res.locals.validated in controllers if needed.
    (res.locals as any).validated = validatedData;

    return next();
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const formattedErrors = error.issues.map((err) => ({
        field: err.path.join('.') || 'body',
        message: err.message,
      }));

      console.error('[validate] Validation failed:', {
        errors: formattedErrors,
        issues: error.issues
      });

      return res.status(400).json({
        status: 'error',
        message: 'Invalid request data. Please check the following fields.',
        errors: formattedErrors,
      });
    }

    // eslint-disable-next-line no-console
    console.error('[validate][ERROR]', error);
    return res.status(500).json({ status: 'error', message: (error as any)?.message || 'Internal server error' });
  }
};
