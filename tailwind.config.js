/** @type {import('tailwindcss').Config} */

/**
 * Semantic colours are wired to the CSS custom properties declared in
 * src/app/globals.css. Because the vars hold bare "r g b" channels, every
 * Tailwind opacity modifier keeps working: bg-accent/10, border-accent/25,
 * ring-accent/40, and so on.
 *
 * The point of this indirection: a class like `text-accent` resolves to a
 * light-mode-safe teal (#0d6b85, 5.6:1) and a dark-mode-safe cyan (#22d3ee)
 * from the same markup. Hardcoding `text-cyan-400` cannot do that — on a
 * near-white page it measures 1.7:1.
 */
const withAlpha = (variable) => `rgb(var(${variable}) / <alpha-value>)`;

module.exports = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── Brand accent ─────────────────────────────────── */
        accent: {
          DEFAULT: withAlpha("--accent-rgb"),
          strong: withAlpha("--accent-strong-rgb"),
          solid: withAlpha("--accent-solid-rgb"),
          vivid: withAlpha("--accent-vivid-rgb"),
          soft: "var(--accent-soft)",
          line: "var(--accent-line)",
        },

        /* ── Text ─────────────────────────────────────────── */
        ink: {
          DEFAULT: withAlpha("--text-primary-rgb"),
          soft: withAlpha("--text-secondary-rgb"),
          muted: withAlpha("--text-muted-rgb"),
          // Foreground for anything sitting on accent-solid. Dark navy in
          // dark mode, white in light — white on cyan-500 is only 2.4:1.
          contrast: "var(--text-on-brand)",
        },

        /* ── Surfaces ─────────────────────────────────────── */
        // Named `page`, not `base`: Tailwind already owns `text-base`
        // as a font size, and a colour of the same name would emit a
        // second `.text-base` rule that silently sets `color`.
        page: withAlpha("--bg-base-rgb"),
        surface: withAlpha("--bg-surface-rgb"),
        card: {
          DEFAULT: withAlpha("--bg-card-rgb"),
          hover: withAlpha("--bg-card-hover-rgb"),
        },

        /* ── Lines ────────────────────────────────────────── */
        line: {
          DEFAULT: "var(--border-subtle)",
          card: "var(--border-card)",
          focus: "var(--border-focus)",
        },
      },

      fontFamily: {
        /* Sora — geometric, engineered feel for headlines */
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        /* Inter — the most legible UI face at 13–16px */
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        /* JetBrains Mono — stack names, metrics, code */
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },

      boxShadow: {
        e1: "var(--shadow-1)",
        e2: "var(--shadow-2)",
        e3: "var(--shadow-3)",
        e4: "var(--shadow-4)",
        glow: "var(--shadow-glow)",
        btn: "var(--shadow-btn)",
      },

      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        "4xl": "2rem",
        "5xl": "2.5rem",
      },

      transitionTimingFunction: {
        "out-3d": "cubic-bezier(0.22, 1, 0.36, 1)",
      },

      /* 3D depth helpers usable straight from JSX */
      perspective: {
        near: "600px",
        DEFAULT: "1000px",
        far: "1800px",
      },
      translate: {
        "z-1": "18px",
        "z-2": "34px",
        "z-3": "56px",
      },

      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
        "float-3d": "float-3d 9s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "rotate-slow": "rotate 20s linear infinite",
        "slide-up": "slideUp 0.6s ease-out",
        "slide-down": "slideDown 0.6s ease-out",
        "fade-in": "fadeIn 0.8s ease-out",
        "fade-up": "fadeUp 0.6s ease-out",
        "scale-in": "scaleIn 0.5s ease-out",
        shimmer: "shimmer 2.4s linear infinite",
        marquee: "marquee 42s linear infinite",
        "marquee-reverse": "marquee-reverse 42s linear infinite",
        "spin-slow": "spin 10s linear infinite",
      },

      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-15px) rotate(2deg)" },
          "66%": { transform: "translateY(-8px) rotate(-1deg)" },
        },
        "float-3d": {
          "0%, 100%": { transform: "translate3d(0,0,0) rotateX(0deg) rotateY(0deg)" },
          "33%": { transform: "translate3d(0,-12px,0) rotateX(2.5deg) rotateY(-2deg)" },
          "66%": { transform: "translate3d(0,-5px,0) rotateX(-1.5deg) rotateY(2.5deg)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgb(var(--accent-rgb) / 0.20)" },
          "50%": { boxShadow: "0 0 42px rgb(var(--accent-rgb) / 0.42)" },
        },
        slideUp: {
          "0%": { transform: "translateY(30px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-30px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        /* Tracks are rendered twice, so -50% is one seamless cycle. */
        marquee: {
          "0%": { transform: "translate3d(0,0,0)" },
          "100%": { transform: "translate3d(-50%,0,0)" },
        },
        "marquee-reverse": {
          "0%": { transform: "translate3d(-50%,0,0)" },
          "100%": { transform: "translate3d(0,0,0)" },
        },
      },

      screens: {
        xs: "380px",
      },
    },
  },
  plugins: [
    /* Utilities Tailwind has no core equivalent for, needed by the 3D system. */
    function ({ addUtilities, matchUtilities, theme }) {
      addUtilities({
        ".preserve-3d": { "transform-style": "preserve-3d" },
        ".backface-hidden": { "backface-visibility": "hidden" },
        ".transform-gpu-3d": { transform: "translate3d(0,0,0)" },
      });

      matchUtilities(
        { perspective: (value) => ({ perspective: value }) },
        { values: theme("perspective") }
      );
    },
  ],
};
