/** @type {import('tailwindcss').Config} */

/**
 * Every colour is a CSS variable holding bare "r g b" channels (see
 * src/app/globals.css), so one class such as `bg-card` or `text-accent/80`
 * resolves correctly in both the black and the light theme.
 */
const c = (v) => `rgb(var(${v}) / <alpha-value>)`;

module.exports = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    container: { center: true, padding: "1rem" },
    extend: {
      colors: {
        bg: c("--bg"),
        elev: c("--elev"),
        card: c("--card"),
        fg: c("--fg"),
        soft: c("--soft"),
        muted: c("--muted"),
        line: c("--line"),
        accent: { DEFAULT: c("--accent"), ink: c("--accent-ink") },
      },
      fontFamily: {
        sans: ["var(--font-grotesk)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      maxWidth: { site: "1240px" },
      keyframes: {
        marquee: { to: { transform: "translate3d(-50%,0,0)" } },
        "spin-slow": { to: { transform: "rotate(360deg)" } },
        "spin-rev": { to: { transform: "rotate(-360deg)" } },
        pulseDot: {
          "0%,100%": { boxShadow: "0 0 0 0 rgb(var(--accent) / .55)" },
          "50%": { boxShadow: "0 0 0 6px rgb(var(--accent) / 0)" },
        },
        flow: { to: { strokeDashoffset: "-40" } },
        shimmer: { to: { backgroundPosition: "200% 0" } },
        blink: { "50%": { opacity: "0" } },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        "spin-slow": "spin-slow 28s linear infinite",
        "spin-rev": "spin-rev 36s linear infinite",
        "pulse-dot": "pulseDot 2s ease-in-out infinite",
        flow: "flow 1.2s linear infinite",
        shimmer: "shimmer 3s linear infinite",
        blink: "blink 1s step-end infinite",
      },
    },
  },
  plugins: [],
};
