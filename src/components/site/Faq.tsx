"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import type { Faq as FaqItem } from "@/content/schema";

export default function Faq({ faqs }: { faqs: FaqItem[] }) {
  const cats = useMemo(() => ["All", ...new Set(faqs.map((f) => f.category || "General"))], [faqs]);
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState<string | null>(faqs[0]?._id ?? null);
  const list = cat === "All" ? faqs : faqs.filter((f) => (f.category || "General") === cat);

  return (
    <div className="mx-auto max-w-3xl">
      {cats.length > 2 && (
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition ${cat === c ? "border-transparent bg-fg text-bg" : "bg-card text-soft hover:text-fg"}`}
            >
              {c}
            </button>
          ))}
        </div>
      )}
      <ul className="space-y-3">
        {list.map((f, i) => {
          const isOpen = open === f._id;
          return (
            <li key={f._id} className={`panel overflow-hidden transition ${isOpen ? "border-accent/40" : ""}`}>
              <h3>
                <button
                  className="flex w-full items-center gap-4 p-5 text-left sm:p-6"
                  aria-expanded={isOpen}
                  aria-controls={`faq-${f._id}`}
                  onClick={() => setOpen(isOpen ? null : f._id)}
                >
                  <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex-1 font-semibold sm:text-lg">{f.question}</span>
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition duration-300 ${isOpen ? "rotate-45 bg-accent text-on-accent" : ""}`}>
                    <Plus className="h-4 w-4" />
                  </span>
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`faq-${f._id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p className="whitespace-pre-line px-5 pb-6 pl-[3.25rem] leading-relaxed text-soft sm:px-6 sm:pl-[3.75rem]">{f.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
