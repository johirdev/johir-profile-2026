import type { IconType } from "react-icons";
import { FaDev, FaDribbble, FaFacebook, FaGithub, FaLinkedin, FaMedium, FaStackOverflow, FaWhatsapp, FaXTwitter, FaYoutube } from "react-icons/fa6";
import { FiArrowUpRight } from "react-icons/fi";

export const SOCIAL_ICONS: Record<string, IconType> = {
  GitHub: FaGithub,
  LinkedIn: FaLinkedin,
  X: FaXTwitter,
  Facebook: FaFacebook,
  YouTube: FaYoutube,
  Dribbble: FaDribbble,
  Medium: FaMedium,
  "Dev.to": FaDev,
  "Stack Overflow": FaStackOverflow,
  WhatsApp: FaWhatsapp,
};

export const socialIcon = (platform: string): IconType => SOCIAL_ICONS[platform] ?? FiArrowUpRight;
export { FaGithub as GithubIcon, FaWhatsapp as WhatsAppIcon };
