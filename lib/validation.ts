import { z } from "zod";
export const rsvpSchema = z.object({ status: z.enum(["ATTENDING", "DECLINED", "MAYBE"]), companions: z.coerce.number().int().min(0).max(20), message: z.string().max(500).optional().default(""), honeypot: z.string().max(0).optional() });
