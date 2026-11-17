import Image, { type ImageProps } from "next/image";

type Props = Omit<ImageProps, "src" | "priority" | "preload"> & {
  src: string;
  /** Above-the-fold image: load eagerly with high fetch priority (Next 16 replacement for `priority`). */
  priority?: boolean;
};

/**
 * next/image for everything. Files in /public are optimised; admin-supplied
 * URLs (uploads or any external host) are served as-is so an arbitrary host
 * never needs to be whitelisted in next.config.
 */
export default function SmartImage({ src, alt, priority, ...rest }: Props) {
  const external = /^https?:\/\//.test(src) || src.startsWith("/api/");
  return (
    <Image
      src={src}
      alt={alt}
      unoptimized={external}
      {...(priority ? { loading: "eager" as const, fetchPriority: "high" as const } : {})}
      {...rest}
    />
  );
}
