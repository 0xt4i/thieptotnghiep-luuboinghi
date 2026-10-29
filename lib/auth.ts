import crypto from "crypto";
import { cookies } from "next/headers";
const cookieName = "graduation_admin";
function signature(value: string) { return crypto.createHmac("sha256", process.env.SESSION_SECRET || "development-secret").update(value).digest("hex"); }
export function isAdmin() { const value = cookies().get(cookieName)?.value || ""; return value.length > 0 && value === signature("admin"); }
export function setAdminCookie() { cookies().set(cookieName, signature("admin"), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 8, path: "/" }); }
export function clearAdminCookie() { cookies().delete(cookieName); }
