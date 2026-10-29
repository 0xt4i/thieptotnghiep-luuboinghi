import type { Metadata } from "next";
import { Be_Vietnam_Pro, Playfair_Display } from "next/font/google";
import "./globals.css";
const sans = Be_Vietnam_Pro({ subsets: ["vietnamese"], variable: "--font-be-vietnam", weight: ["400","500","600","700"] });
const display = Playfair_Display({ subsets: ["vietnamese"], variable: "--font-playfair" });
export const metadata: Metadata = { title: "Lễ tốt nghiệp | Lưu Bội Nghi", description: "Thiệp mời lễ tốt nghiệp được cá nhân hóa" };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="vi"><body className={`${sans.variable} ${display.variable} font-sans`}>{children}</body></html>; }
