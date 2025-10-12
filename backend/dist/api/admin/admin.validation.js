"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTherapistStatusSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.updateTherapistStatusSchema = {
    body: zod_1.z.object({
        status: zod_1.z.nativeEnum(client_1.TherapistStatus),
    }),
    params: zod_1.z.object({
        therapistId: zod_1.z.string().cuid(),
    }),
};
