import Reveal from "./Reveal";

export default function SectionHeading({
  eyebrow,
  title,
  accent,
  intro,
  align = "center",
  index,
}: {
  eyebrow: string;
  title: string;
  /** Trailing words rendered in the accent gradient */
  accent?: string;
  intro?: string;
  align?: "center" | "left";
  index?: string;
}) {
  const center = align === "center";
  return (
    <Reveal className={`mb-8 flex flex-col gap-3 sm:mb-12 ${center ? "items-center text-center" : "items-start"}`}>
      <span className="eyebrow">
        {index && <span className="text-accent-ink">{index}</span>}
        {eyebrow}
      </span>
      <h2 className="max-w-3xl text-balance text-3xl font-bold leading-[1.08] tracking-tight sm:text-5xl">
        {title} {accent && <span className="text-gradient">{accent}</span>}
      </h2>
      {intro && <p className={`max-w-2xl text-pretty text-base text-soft sm:text-lg ${center ? "" : ""}`}>{intro}</p>}
    </Reveal>
  );
}
