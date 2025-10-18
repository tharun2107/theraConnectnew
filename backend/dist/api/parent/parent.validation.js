"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateParentProfileSchema = exports.childIdParamSchema = exports.updateChildSchema = exports.childSchema = void 0;
const zod_1 = require("zod");
exports.childSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2),
        age: zod_1.z.number().int().positive(),
        address: zod_1.z.string().optional(),
        condition: zod_1.z.string().optional(),
        notes: zod_1.z.string().optional(),
    }),
});
exports.updateChildSchema = exports.childSchema.partial();
exports.childIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        childId: zod_1.z.string().cuid(),
    }),
});
exports.updateParentProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).optional(),
        phone: zod_1.z.string().min(10).optional(),
    }).refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field is required',
    }),
});
