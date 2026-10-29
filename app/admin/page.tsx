import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";
export default function AdminPage() { if (isAdmin()) redirect("/admin/dashboard"); return <main className="min-h-screen flex items-center justify-center p-6"><section className="paper w-full max-w-md rounded-3xl p-8"><h1 className="font-display text-3xl text-navy">Quản trị thiệp</h1><p className="mt-2 text-sm text-slate-600">Đăng nhập để quản lý khách mời và RSVP.</p><LoginForm /></section></main>; }
