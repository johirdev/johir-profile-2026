"use client";


interface EyebrowProps {
  label: string;
  className?: string;
  alignment?: string;
}

/** Small pill badge with a colored dot — used above section headings. */
export default function Eyebrow({ label, className = "", alignment = "" }: EyebrowProps) {

  const bg = "bg-accent-soft";
  const border = "border-accent-line";
  const text = "text-accent";
  const dot = "bg-accent-solid";

  return (
    <div className={`flex justify-center ${alignment}`}>
      <div
        className={`inline-flex  items-center gap-2 px-4 py-1.5 rounded-full mx-auto border ${border} ${bg} ${text} text-[11px] font-bold tracking-[0.14em] uppercase mb-6 ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0`} />
        {label}
      </div>
    </div>
  );
}
