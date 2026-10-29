import type { Config } from "tailwindcss";
// Tokens follow design-system/thiep-tot-nghiep/MASTER.md — gold is for dark (navy) surfaces only; use accent for text on light.
export default { content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"], theme: { extend: { colors: { navy: { DEFAULT: "#0b2545", deep: "#071b33" }, gold: "#c9a227", cream: "#f8f3e8", ink: "#0f172a", muted: "#64748b", line: "#cbd5e1", accent: "#b45309" }, fontFamily: { sans: ["var(--font-be-vietnam)", "sans-serif"], display: ["var(--font-garamond)", "serif"] } } }, plugins: [] } satisfies Config;
