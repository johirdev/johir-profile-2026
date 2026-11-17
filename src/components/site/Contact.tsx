"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2, Clock, Copy, Loader2, Mail, MapPin, Phone, Send, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { SiteSettings } from "@/content/schema";
import { WhatsAppIcon, socialIcon } from "@/lib/social";
import { usePublicForm } from "./usePublicForm";

const SUBJECTS = ["Full-time role", "Freelance project", "Consulting", "Collaboration", "Just saying hi"] as const;
const BUDGETS = ["Not sure yet", "< $1k", "$1k – $5k", "$5k – $15k", "$15k+"] as const;



export default function Contact({ site }: { site: SiteSettings }) {
  const { state, error, submit, markStart, reset } = usePublicForm("contact");
  const [subject, setSubject] = useState<(typeof SUBJECTS)[number]>("Freelance project");
  const [budget, setBudget] = useState<(typeof BUDGETS)[number]>("Not sure yet");
  const [message, setMessage] = useState("");
  const showBudget = subject === "Freelance project" || subject === "Consulting";

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const ok = await submit({
      name: fd.get("name"),
      email: fd.get("email"),
      website: fd.get("website"),
      subject,
      ...(showBudget ? { budget } : {}),
      message,
    });
    if (ok) {
      form.reset();
      setMessage("");
    }
  };

  const copyEmail = async () => {
    if (!site.email) return;
    try {
      await navigator.clipboard.writeText(site.email);
      toast.success("Email copied");
    } catch {}
  };

  const channels = [
    site.email && { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}`, action: copyEmail },
    site.whatsapp && { icon: WhatsAppIcon, label: "WhatsApp", value: site.phone || "Chat now", href: site.whatsapp },
    site.phone && { icon: Phone, label: "Phone", value: site.phone, href: `tel:${site.phone.replace(/\s/g, "")}` },
  ].filter(Boolean) as { icon: React.ComponentType<{ className?: string }>; label: string; value: string; href: string; action?: () => void }[];

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      {/* Info */}
      <div className="flex min-w-0 flex-col gap-4">
        <div className="panel relative overflow-hidden p-6 sm:p-8">
          <div aria-hidden className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
          {site.available && (
            <span className="chip mb-5">
              <span className="h-2 w-2 animate-pulse-dot rounded-full bg-emerald-500" /> {site.availabilityText}
            </span>
          )}
          <h3 className="text-2xl font-semibold tracking-tight">Have a project or a role in mind?</h3>
          <p className="mt-2 text-soft">Tell me about it — I usually reply within 24 hours.</p>
          <dl className="mt-6 grid gap-3 text-sm">
            {site.location && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-accent" />
                <dt className="sr-only">Location</dt>
                <dd>{site.location}</dd>
              </div>
            )}
            {site.timezone && (
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-accent" />
                <dt className="sr-only">Timezone</dt>
                <dd>{site.timezone}</dd>
              </div>
            )}
          </dl>
        </div>

        {channels.map((c) => (
          <div key={c.label} className="panel panel-hover group flex items-center gap-4 p-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-fg text-bg transition group-hover:bg-accent group-hover:text-on-accent">
              <c.icon className="h-5 w-5" />
            </span>
            <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="min-w-0 flex-1">
              <span className="block text-xs text-muted">{c.label}</span>
              <span className="block truncate font-medium">{c.value}</span>
            </a>
            {c.action ? (
              <button onClick={c.action} aria-label={`Copy ${c.label}`} className="grid h-9 w-9 place-items-center rounded-full border text-muted hover:text-fg">
                <Copy className="h-4 w-4" />
              </button>
            ) : (
              <ArrowUpRight className="h-4 w-4 text-muted transition group-hover:rotate-45 group-hover:text-accent" />
            )}
          </div>
        ))}

        {(!!site.socials?.length || site.whatsapp) && (
          <div className="flex flex-wrap gap-2">
            {site.whatsapp && !site.socials?.some((s) => s.platform === "WhatsApp") && (
              <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="btn-ghost !py-2.5">
                <WhatsAppIcon className="h-4 w-4" /> WhatsApp
              </a>
            )}
            {(site.socials ?? []).map((s) => {
              const Icon = socialIcon(s.platform);
              return (
                <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer me" className="btn-ghost !py-2.5">
                  <Icon className="h-4 w-4" /> {s.platform}
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* Form */}
      <div className="panel relative min-w-0 overflow-hidden p-6 sm:p-8">
        <AnimatePresence mode="wait">
          {state === "sent" ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-[420px] flex-col items-center justify-center gap-3 text-center"
            >
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
                <CheckCircle2 className="h-16 w-16 text-emerald-500" />
              </motion.span>
              <h3 className="text-2xl font-semibold">Message sent!</h3>
              <p className="max-w-sm text-soft">Thanks for reaching out. I&apos;ll get back to you within 24 hours.</p>
              <button onClick={reset} className="btn-ghost mt-3">Send another</button>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={onSubmit} onFocus={markStart} className="grid gap-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* honeypot */}
              <div aria-hidden className="absolute left-[-9999px] top-0">
                <label>
                  Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>

              <fieldset>
                <legend className="label">I&apos;m reaching out about</legend>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setSubject(s)}
                      aria-pressed={subject === s}
                      className={`rounded-full border px-3.5 py-2 text-sm transition ${subject === s ? "border-transparent bg-fg text-bg" : "bg-bg text-soft hover:text-fg"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="label">Your name</span>
                  <input name="name" required minLength={2} maxLength={80} autoComplete="name" className="field" placeholder="Jane Doe" />
                </label>
                <label>
                  <span className="label">Email</span>
                  <input name="email" type="email" required maxLength={160} autoComplete="email" className="field" placeholder="jane@company.com" />
                </label>
              </div>

              <AnimatePresence initial={false}>
                {showBudget && (
                  <motion.fieldset initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <legend className="label">Estimated budget</legend>
                    <div className="flex flex-wrap gap-2">
                      {BUDGETS.map((b) => (
                        <button
                          type="button"
                          key={b}
                          onClick={() => setBudget(b)}
                          aria-pressed={budget === b}
                          className={`rounded-xl border px-3 py-2 text-sm transition ${budget === b ? "border-accent bg-accent/10 text-fg" : "bg-bg text-soft hover:text-fg"}`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </motion.fieldset>
                )}
              </AnimatePresence>

              <label>
                <span className="label flex justify-between">
                  Message <span className={`normal-case tracking-normal ${message.length > 2900 ? "text-red-500" : ""}`}>{message.length}/3000</span>
                </span>
                <textarea
                  name="message"
                  required
                  minLength={20}
                  maxLength={3000}
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="field resize-y"
                  placeholder="A few lines about the project, timeline and goals…"
                />
              </label>

              {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</p>}

              <div className="flex flex-col-reverse items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-2 text-xs text-muted">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" /> Spam-protected · Your details are never shared.
                </p>
                <button type="submit" disabled={state === "sending"} className="btn-accent w-full sm:w-auto">
                  {state === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {state === "sending" ? "Sending…" : "Send message"}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
