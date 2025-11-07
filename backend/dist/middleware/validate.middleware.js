"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schemas) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validatedData = {};
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
                validatedData.body = yield schemas.body.parseAsync(req.body);
                console.log('[validate] Body validation passed:', validatedData.body);
            }
            catch (e) {
                console.error('[validate.body][ERROR]', e.issues || e);
                throw e;
            }
        }
        if (schemas.query) {
            // Debug log for query validation
            // eslint-disable-next-line no-console
            console.log('[validate] incoming query=', req.query);
            try {
                validatedData.query = yield schemas.query.parseAsync(req.query);
            }
            catch (e) {
                console.error('[validate.query][ERROR]', e.issues || e);
                throw e;
            }
            // eslint-disable-next-line no-console
            console.log('[validate] validated query=', validatedData.query);
        }
        if (schemas.params) {
            console.log('[validate] Validating params:', req.params);
            try {
                validatedData.params = yield schemas.params.parseAsync(req.params);
                console.log('[validate] Params validation passed:', validatedData.params);
            }
            catch (e) {
                console.error('[validate.params][ERROR]', e.issues || e);
                throw e;
            }
        }
        // Apply only body (safe to overwrite). For query/params, avoid assignment
        // because in Express 5 these are readonly accessors and reassigning throws.
        if (validatedData.body)
            req.body = validatedData.body;
        // Make validated values available without mutating Express objects
        // Access via res.locals.validated in controllers if needed.
        res.locals.validated = validatedData;
        return next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
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
        return res.status(500).json({ status: 'error', message: (error === null || error === void 0 ? void 0 : error.message) || 'Internal server error' });
    }
});
exports.validate = validate;
