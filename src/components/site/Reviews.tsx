"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, MessageSquarePlus, Quote, Star, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { Review } from "@/content/schema";
import SmartImage from "@/components/ui/SmartImage";
import { usePublicForm } from "./usePublicForm";

function Stars({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <span className="flex gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${size} ${i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-muted/40"}`} />
      ))}
    </span>
  );
}

function Avatar({ r, size = 44 }: { r: Review; size?: number }) {
  const initials = r.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <span className="relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-accent to-fuchsia-500 font-semibold text-white" style={{ width: size, height: size }}>
      {r.avatar ? <SmartImage src={r.avatar} alt="" fill sizes={`${size}px`} className="object-cover" /> : initials}
    </span>
  );
}

function ReviewCard({ r }: { r: Review }) {
  return (
    <figure className="panel w-[300px] shrink-0 p-5 sm:w-auto">
      <Stars value={r.rating} />
      <blockquote className="mt-3 text-sm leading-relaxed text-soft">“{r.quote}”</blockquote>
      <figcaption className="mt-4 flex items-center gap-3">
        <Avatar r={r} size={36} />
        <span className="min-w-0 text-sm">
          <span className="block truncate font-semibold">{r.name}</span>
          <span className="block truncate text-xs text-muted">{[r.role, r.company, r.country].filter(Boolean).join(" · ")}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export default function Reviews({ reviews }: { reviews: Review[] }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const avg = reviews.length ? reviews.reduce((n, r) => n + (Number(r.rating) || 0), 0) / reviews.length : 0;
  const featured = reviews.find((r) => r.featured) ?? reviews[0];
  const others = reviews.filter((r) => r !== featured);
  const colA = others.filter((_, i) => i % 2 === 0);
  const colB = others.filter((_, i) => i % 2 === 1);

  return (
    <>
      {reviews.length === 0 ? (
        <div className="panel mx-auto flex max-w-2xl flex-col items-center gap-4 p-10 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent/15 text-accent">
            <Quote className="h-6 w-6" />
          </span>
          <h3 className="text-xl font-semibold">Worked with me? I&apos;d love to hear about it.</h3>
          <p className="text-soft">Your feedback helps other teams decide — and helps me grow.</p>
          <button onClick={() => setOpen(true)} className="btn-primary">
            <MessageSquarePlus className="h-4 w-4" /> Leave feedback
          </button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col gap-6">
            <div className="panel flex items-center justify-between gap-4 p-6">
              <div>
                <p className="text-5xl font-bold tracking-tight">{avg.toFixed(1)}</p>
                <Stars value={avg} size="h-5 w-5" />
                <p className="mt-1 text-sm text-muted">from {reviews.length} client review{reviews.length > 1 ? "s" : ""}</p>
              </div>
              <button onClick={() => setOpen(true)} className="btn-ghost">
                <MessageSquarePlus className="h-4 w-4" /> <span className="hidden sm:inline">Leave feedback</span>
              </button>
            </div>
            {featured && (
              <figure className="panel relative flex-1 overflow-hidden p-7 sm:p-9">
                <Quote className="absolute right-6 top-6 h-16 w-16 text-accent/15" />
                <Stars value={featured.rating} size="h-5 w-5" />
                <blockquote className="mt-5 text-pretty text-xl font-medium leading-relaxed sm:text-2xl">“{featured.quote}”</blockquote>
                <figcaption className="mt-8 flex items-center gap-4">
                  <Avatar r={featured} size={52} />
                  <span>
                    <span className="block font-semibold">{featured.name}</span>
                    <span className="block text-sm text-muted">{[featured.role, featured.company].filter(Boolean).join(" · ")}</span>
                    {featured.project && <span className="mt-1 block font-mono text-[11px] text-accent-ink">Project: {featured.project}</span>}
                  </span>
                </figcaption>
              </figure>
            )}
          </div>

          {others.length > 0 && (
            <>
              {/* Desktop: two vertical marquees */}
              <div className="relative hidden h-[560px] grid-cols-2 gap-4 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)] lg:grid">
                {[colA, colB].map((col, ci) => (
                  <div key={ci} className="group">
                    <div
                      className="flex flex-col gap-4 group-hover:[animation-play-state:paused]"
                      style={{ animation: col.length > 1 ? `reviewsUp ${col.length * 9}s linear infinite ${ci ? "reverse" : ""}` : undefined }}
                    >
                      {[...col, ...(col.length > 1 ? col : [])].map((r, i) => (
                        <ReviewCard key={`${r._id}-${i}`} r={r} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {/* Mobile: horizontal scroll */}
              <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 lg:hidden">
                {others.map((r) => (
                  <div key={r._id} className="snap-start">
                    <ReviewCard r={r} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      <style>{`@keyframes reviewsUp{to{transform:translateY(-50%)}}`}</style>
      <AnimatePresence>{open && <FeedbackModal onClose={close} />}</AnimatePresence>
    </>
  );
}

function FeedbackModal({ onClose }: { onClose: () => void }) {
  const { state, error, submit, markStart } = usePublicForm("feedback");
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);

  useEffect(() => {
    markStart();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, markStart]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await submit({ ...Object.fromEntries(fd), rating });
  };

  return (
    <motion.div
      className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="fb-title"
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="panel max-h-[90vh] w-full max-w-lg overflow-y-auto p-6 shadow-2xl sm:p-8"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h3 id="fb-title" className="text-xl font-semibold">Share your feedback</h3>
            <p className="text-sm text-muted">It appears on the site after a quick review.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full border">
            <X className="h-4 w-4" />
          </button>
        </div>

        {state === "sent" ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <p className="text-lg font-semibold">Thank you!</p>
            <p className="text-soft">Your feedback was received and will be published after review.</p>
            <button onClick={onClose} className="btn-primary mt-2">Close</button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute left-[-9999px] h-0 w-0 opacity-0" />
            <div className="sm:col-span-2">
              <span className="label">Rating</span>
              <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <button type="button" key={i} onClick={() => setRating(i)} onMouseEnter={() => setHover(i)} aria-label={`${i} stars`}>
                    <Star className={`h-7 w-7 transition ${(hover || rating) >= i ? "fill-amber-400 text-amber-400" : "text-muted/40"}`} />
                  </button>
                ))}
              </div>
            </div>
            <label className="sm:col-span-2">
              <span className="label">Your name *</span>
              <input name="name" required maxLength={80} className="field" placeholder="Jane Doe" />
            </label>
            <label>
              <span className="label">Role</span>
              <input name="role" maxLength={80} className="field" placeholder="Product Manager" />
            </label>
            <label>
              <span className="label">Company</span>
              <input name="company" maxLength={80} className="field" placeholder="Acme Inc." />
            </label>
            <label>
              <span className="label">Country</span>
              <input name="country" maxLength={60} className="field" placeholder="Japan" />
            </label>
            <label>
              <span className="label">Project</span>
              <input name="project" maxLength={120} className="field" placeholder="Website redesign" />
            </label>
            <label className="sm:col-span-2">
              <span className="label">Feedback * (30+ characters)</span>
              <textarea name="quote" required minLength={30} maxLength={900} rows={4} className="field resize-none" placeholder="What was it like to work together?" />
            </label>
            {error && <p className="text-sm text-red-500 sm:col-span-2">{error}</p>}
            <button type="submit" disabled={state === "sending"} className="btn-accent sm:col-span-2">
              {state === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Submit feedback
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
