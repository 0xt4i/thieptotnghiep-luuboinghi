import { z } from "zod";
export const rsvpSchema = z.object({ status: z.enum(["ATTENDING", "DECLINED", "MAYBE"]), companions: z.coerce.number().int().min(0).max(20), message: z.string().max(500).optional().default(""), honeypot: z.string().max(0).optional() });
export const guestGroups = ["Gia đình", "Bạn bè", "Khác"] as const;
export const guestSchema = z.object({
  name: z.string().trim().min(1).max(200),
  salutation: z.string().trim().min(1).max(50),
  group: z.enum(guestGroups),
  contact: z.string().trim().max(200).optional().default(""),
  personalNote: z.string().trim().max(500).optional().default(""),
});
