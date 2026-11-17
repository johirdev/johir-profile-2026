import { useThemeStore } from "@/app/lib/store";

export const useDarkLightColor = () => {
  const theme = useThemeStore((state) => state.theme);
  const dark = theme === "dark";

  return {
    sectionBg: dark ? "bg-[#060D1A]" : "",
    lightBg: dark ? "" : "!bg-[#F4F7FB]",

    // Headings: white on dark, logo blue on light — matches the Coders24 mark
    heading: dark ? "text-white" : "text-[#0A4590]",
    body: "text-ink-soft",

    // Was purple (#a78bfa/#7c3aed) — didn't match the logo at all, now uses the logo's blue
    eyebrow: dark ? "text-[#5FB3FF]" : "text-[#1568C4]",

    gradientFrom: dark ? "from-[#2F8FE6]" : "from-[#0A4590]",
    cardShadow: "shadow-e3",

    // Badge bg now matches the exact logo blue instead of generic Tailwind blue
    badgeBg: dark ? "bg-[#2F8FE6]" : "bg-[#1568C4]",
    BgColor: dark ? "#fff" : "#0A4590",
  };
};
