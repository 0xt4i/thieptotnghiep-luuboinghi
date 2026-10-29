import type { Config } from "tailwindcss";
export default { content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"], theme: { extend: { colors: { navy: "#11253f", gold: "#d3a84f", cream: "#fbf7ef", ink: "#263238", accent: "#b45309" }, fontFamily: { sans: ["var(--font-be-vietnam)", "sans-serif"], display: ["var(--font-playfair)", "serif"] } } }, plugins: [] } satisfies Config;
