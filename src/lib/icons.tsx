import type { ComponentType, SVGProps } from "react";
import {
  SiAnthropic, SiClaude, SiCloudflare, SiCursor, SiDeepseek, SiDigitalocean, SiDocker, SiExpress,
  SiFigma, SiFirebase, SiFramer, SiGin, SiGit, SiGithub, SiGithubactions, SiGithubcopilot, SiGo,
  SiGooglecloud, SiGooglegemini, SiGrafana, SiHtml5, SiHuggingface, SiJavascript, SiJest,
  SiJsonwebtokens, SiKubernetes, SiLangchain, SiLaravel, SiLinux, SiMake, SiMarkdown, SiMistralai,
  SiMongodb, SiMysql, SiNextdotjs, SiNginx, SiNodedotjs, SiNotion, SiOllama, SiPhp, SiPm2,
  SiPostgresql, SiPostman, SiPrisma, SiPython, SiReact, SiReactquery, SiRedis, SiRedux, SiShadcnui,
  SiSocketdotio, SiStorybook, SiSupabase, SiSwagger, SiTailwindcss, SiTerraform, SiTypescript,
  SiUbuntu, SiVercel, SiVite, SiZapier, SiZod, SiCss,
} from "react-icons/si";
import { FaAws } from "react-icons/fa6";
import { TbBrandOpenai } from "react-icons/tb";
import {
  BookOpen, Bot, Boxes, Brain, Briefcase, ChartLine, Clock, Cloud, Code2, Compass, Cpu, Database,
  FileText, Gauge, GitBranch, Globe, GraduationCap, Layers, LayoutTemplate, Lightbulb, Lock,
  MessageSquare, Palette, Puzzle, RefreshCw, Rocket, Server, ShieldCheck, ShoppingCart, Smartphone,
  Sparkles, Target, Terminal, Users, Workflow, Wrench, Zap, CircleCheck, Handshake, Search,
} from "lucide-react";

type IconComp = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string; color?: string }>;

/** n8n mark — Simple Icons removed it, so it is drawn here. */
const N8n: IconComp = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M21.47 5.6a2.53 2.53 0 0 0-2.45 1.9h-2.86a2.53 2.53 0 0 0-2.5 2.12l-.1.6a1.26 1.26 0 0 1-1.25 1.06h-.98a2.53 2.53 0 0 0-4.9 0H4.88a2.53 2.53 0 1 0 0 1.26h1.55a2.53 2.53 0 0 0 4.9 0h.98a1.26 1.26 0 0 1 1.25 1.06l.1.6a2.53 2.53 0 0 0 2.5 2.12h.32a2.53 2.53 0 1 0 0-1.27h-.32a1.26 1.26 0 0 1-1.25-1.06l-.1-.6a2.52 2.52 0 0 0-.84-1.48 2.52 2.52 0 0 0 .84-1.48l.1-.6a1.26 1.26 0 0 1 1.25-1.06h2.86a2.53 2.53 0 1 0 2.45-3.16zM2.53 13.27a1.27 1.27 0 1 1 0-2.54 1.27 1.27 0 0 1 0 2.54zm6.33 0a1.27 1.27 0 1 1 0-2.54 1.27 1.27 0 0 1 0 2.54zm9.9 3.16a1.27 1.27 0 1 1 0 2.54 1.27 1.27 0 0 1 0-2.54zm2.71-7.6a1.27 1.27 0 1 1 0-2.53 1.27 1.27 0 0 1 0 2.54z" />
  </svg>
);

export interface IconDef {
  label: string;
  Icon: IconComp;
  /** Brand colour; `null` = follow the text colour (monochrome marks). */
  color: string | null;
  kind: "tech" | "ai" | "ui";
}

const t = (label: string, Icon: IconComp, color: string | null): IconDef => ({ label, Icon, color, kind: "tech" });
const a = (label: string, Icon: IconComp, color: string | null): IconDef => ({ label, Icon, color, kind: "ai" });
const u = (label: string, Icon: IconComp): IconDef => ({ label, Icon: Icon as IconComp, color: null, kind: "ui" });

export const ICONS: Record<string, IconDef> = {
  /* Languages & frontend */
  javascript: t("JavaScript", SiJavascript, "#F7DF1E"),
  typescript: t("TypeScript", SiTypescript, "#3178C6"),
  html: t("HTML5", SiHtml5, "#E34F26"),
  css: t("CSS", SiCss, "#663399"),
  react: t("React", SiReact, "#61DAFB"),
  nextjs: t("Next.js", SiNextdotjs, null),
  tailwind: t("Tailwind CSS", SiTailwindcss, "#06B6D4"),
  shadcn: t("shadcn/ui", SiShadcnui, null),
  redux: t("Redux Toolkit", SiRedux, "#764ABC"),
  tanstack: t("TanStack Query", SiReactquery, "#FF4154"),
  framer: t("Framer Motion", SiFramer, null),
  vite: t("Vite", SiVite, "#646CFF"),
  zod: t("Zod", SiZod, "#3E67B1"),
  storybook: t("Storybook", SiStorybook, "#FF4785"),
  figma: t("Figma", SiFigma, "#F24E1E"),
  /* Backend */
  nodejs: t("Node.js", SiNodedotjs, "#5FA04E"),
  express: t("Express.js", SiExpress, null),
  go: t("Go", SiGo, "#00ADD8"),
  gin: t("Gin", SiGin, "#008ECF"),
  python: t("Python", SiPython, "#3776AB"),
  php: t("PHP", SiPhp, "#777BB4"),
  laravel: t("Laravel", SiLaravel, "#FF2D20"),
  socketio: t("Socket.io", SiSocketdotio, null),
  jwt: t("JWT", SiJsonwebtokens, null),
  swagger: t("Swagger", SiSwagger, "#85EA2D"),
  postman: t("Postman", SiPostman, "#FF6C37"),
  jest: t("Jest", SiJest, "#C21325"),
  /* Data */
  mongodb: t("MongoDB", SiMongodb, "#47A248"),
  postgresql: t("PostgreSQL", SiPostgresql, "#4169E1"),
  mysql: t("MySQL", SiMysql, "#4479A1"),
  redis: t("Redis", SiRedis, "#FF4438"),
  prisma: t("Prisma", SiPrisma, null),
  firebase: t("Firebase", SiFirebase, "#FFCA28"),
  supabase: t("Supabase", SiSupabase, "#3FCF8E"),
  /* Cloud & DevOps */
  docker: t("Docker", SiDocker, "#2496ED"),
  kubernetes: t("Kubernetes", SiKubernetes, "#326CE5"),
  nginx: t("Nginx", SiNginx, "#009639"),
  "github-actions": t("GitHub Actions", SiGithubactions, "#2088FF"),
  linux: t("Linux", SiLinux, null),
  ubuntu: t("Ubuntu", SiUbuntu, "#E95420"),
  aws: t("AWS", FaAws, "#FF9900"),
  gcp: t("Google Cloud", SiGooglecloud, "#4285F4"),
  vercel: t("Vercel", SiVercel, null),
  cloudflare: t("Cloudflare", SiCloudflare, "#F38020"),
  digitalocean: t("DigitalOcean", SiDigitalocean, "#0080FF"),
  terraform: t("Terraform", SiTerraform, "#844FBA"),
  pm2: t("PM2", SiPm2, null),
  grafana: t("Grafana", SiGrafana, "#F46800"),
  git: t("Git", SiGit, "#F05032"),
  github: t("GitHub", SiGithub, null),
  markdown: t("Markdown", SiMarkdown, null),
  notion: t("Notion", SiNotion, null),
  /* AI */
  claude: a("Claude", SiClaude, "#D97757"),
  "claude-code": a("Claude Code", SiClaude, "#D97757"),
  anthropic: a("Anthropic", SiAnthropic, null),
  chatgpt: a("ChatGPT", TbBrandOpenai as IconComp, null),
  gemini: a("Gemini", SiGooglegemini, "#8E75B2"),
  copilot: a("GitHub Copilot", SiGithubcopilot, null),
  cursor: a("Cursor", SiCursor, null),
  deepseek: a("DeepSeek", SiDeepseek, "#4D6BFE"),
  huggingface: a("Hugging Face", SiHuggingface, "#FFD21E"),
  langchain: a("LangChain", SiLangchain, null),
  ollama: a("Ollama", SiOllama, null),
  mistral: a("Mistral AI", SiMistralai, "#FA520F"),
  n8n: a("n8n", N8n, "#EA4B71"),
  zapier: a("Zapier", SiZapier, "#FF4F00"),
  make: a("Make", SiMake, "#6D00CC"),
  /* Generic UI glyphs (services, reasons, groups) */
  code: u("Code", Code2),
  layers: u("Layers", Layers),
  cpu: u("CPU", Cpu),
  server: u("Server", Server),
  database: u("Database", Database),
  cloud: u("Cloud", Cloud),
  shield: u("Shield", ShieldCheck),
  rocket: u("Rocket", Rocket),
  sparkles: u("Sparkles", Sparkles),
  bot: u("Bot", Bot),
  workflow: u("Workflow", Workflow),
  palette: u("Palette", Palette),
  smartphone: u("Mobile", Smartphone),
  gauge: u("Performance", Gauge),
  branch: u("Branch", GitBranch),
  terminal: u("Terminal", Terminal),
  layout: u("Layout", LayoutTemplate),
  zap: u("Zap", Zap),
  check: u("Check", CircleCheck),
  book: u("Book", BookOpen),
  users: u("Users", Users),
  message: u("Message", MessageSquare),
  target: u("Target", Target),
  compass: u("Compass", Compass),
  puzzle: u("Puzzle", Puzzle),
  refresh: u("Refresh", RefreshCw),
  lock: u("Lock", Lock),
  chart: u("Chart", ChartLine),
  globe: u("Globe", Globe),
  briefcase: u("Briefcase", Briefcase),
  graduation: u("Graduation", GraduationCap),
  brain: u("Brain", Brain),
  wrench: u("Wrench", Wrench),
  boxes: u("Boxes", Boxes),
  clock: u("Clock", Clock),
  file: u("Document", FileText),
  lightbulb: u("Idea", Lightbulb),
  cart: u("Cart", ShoppingCart),
  handshake: u("Handshake", Handshake),
  search: u("Search", Search),
};

export const ICON_KEYS = Object.keys(ICONS);
export const iconLabel = (key?: string) => (key && ICONS[key]?.label) || key || "";

/** Renders a registry icon; unknown keys fall back to a neutral glyph. */
export function TechIcon({
  name,
  className = "h-5 w-5",
  mono = false,
  title,
}: {
  name?: string;
  className?: string;
  /** Force monochrome (inherits currentColor). */
  mono?: boolean;
  title?: string;
}) {
  const def = (name && ICONS[name]) || ICONS.code;
  const { Icon } = def;
  return (
    <Icon
      className={className}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      style={!mono && def.color ? { color: def.color } : undefined}
    />
  );
}
