import Image from "next/image";

/** Johirul Islam Rasel's own "JR" logo (public/images/logo-johirul-islam-rasel.png). */
export const LOGO_SRC = "/images/logo-johirul-islam-rasel.png";

export function LogoMark({ className = "h-9 w-9", title = "Johirul Islam Rasel logo" }: { className?: string; title?: string }) {
  return (
    <span className={`relative inline-block shrink-0 ${className}`}>
      <Image src={LOGO_SRC} alt={title} fill sizes="64px" className="object-contain drop-shadow-[0_4px_12px_rgb(34_184_222/0.35)]" priority />
    </span>
  );
}
