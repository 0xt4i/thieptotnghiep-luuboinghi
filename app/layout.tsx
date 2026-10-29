import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, EB_Garamond } from "next/font/google";
import "./globals.css";
const sans = Be_Vietnam_Pro({ subsets: ["latin", "vietnamese"], variable: "--font-be-vietnam", weight: ["400","500","600","700"] });
const display = EB_Garamond({ subsets: ["latin", "vietnamese"], variable: "--font-garamond", style: ["normal", "italic"] });
export const metadata: Metadata = { title: "Lễ tốt nghiệp | Lưu Bội Nghi", description: "Thiệp mời lễ tốt nghiệp được cá nhân hóa" };
// viewport-fit=cover makes env(safe-area-inset-*) available for the sticky action bar.
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#0b2545" };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="vi"><body className={`${sans.variable} ${display.variable} font-sans`}>{children}</body></html>; }
