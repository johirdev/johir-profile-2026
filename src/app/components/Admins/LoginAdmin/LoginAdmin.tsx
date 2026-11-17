/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  useContext,
  useEffect,
  useState,
  ChangeEvent,
  FormEvent,
  useCallback,
} from "react";
import "@/app/globals.css";
import { Eye, EyeOff, RefreshCw, Lock, Mail, ShieldCheck } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/app/admins/AuthProvider";
import { toast } from "react-toastify";
import Link from "next/link";

interface FormData {
  email: string;
  password: string;
  remember: boolean;
}

interface Errors {
  email?: string;
  password?: string;
  captcha?: string;
}

export default function LoginAdmin() {
  const { loginAdmin } = useContext(AuthContext);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    remember: true,
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [captcha, setCaptcha] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const router = useRouter();

  // ✅ CAPTCHA GENERATOR
  const generateCaptcha = useCallback(() => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";

    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setCaptcha(code);
  }, []);

  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCaptchaChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCaptchaInput(e.target.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const validationErrors: Errors = {};

    if (!formData.email) validationErrors.email = "Email is required";
    if (!formData.password) validationErrors.password = "Password is required";
    if (captchaInput !== captcha)
      validationErrors.captcha = "Captcha does not match";

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      generateCaptcha();
      setCaptchaInput("");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("/api/v1/admins/login", {
        admin_email: formData.email,
        admin_password: formData.password,
      });

      const data = res.data;

      if (data.success) {
        loginAdmin(data.data.access_token);

        Swal.fire({
          title: "Login Success",
          text: data.message || "Login successful!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        router.push("/admins");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Login failed");

      Swal.fire({
        title: "Login Failed!",
        text: err?.response?.data?.message || "Login Error",
        icon: "error",
        timer: 1500,
        showConfirmButton: false,
      });
    } finally {
      setLoading(false);
      generateCaptcha();
      setCaptchaInput("");
    }
  };

  return (
    <div className="admin-login-root relative min-h-screen w-full overflow-hidden bg-[#100C2A]">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap");

        .admin-login-root {
          font-family: "Inter", ui-sans-serif, system-ui, sans-serif;
        }
        .font-display {
          font-family: "Sora", ui-sans-serif, system-ui, sans-serif;
        }
        .font-mono-brand {
          font-family: "JetBrains Mono", ui-monospace, monospace;
        }
        @keyframes float-orb {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-16px, 20px) scale(1.06);
          }
        }
        @keyframes drift-grid {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 48px 48px;
          }
        }
        .orb-anim {
          animation: float-orb 9s ease-in-out infinite;
        }
        .grid-anim {
          animation: drift-grid 14s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .orb-anim,
          .grid-anim {
            animation: none;
          }
        }
      `}</style>

      {/* Full-page dark background: grid + glowing orbs */}
      <div
        className="grid-anim pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="orb-anim pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl" />
      <div className="orb-anim pointer-events-none absolute bottom-[-6rem] right-[-4rem] h-96 w-96 rounded-full bg-violet-500/30 blur-3xl" />

      {/* Brand mark, fixed corner */}
      <Link href="/" >
        <div className="relative z-10 flex items-center gap-2 p-6 font-display text-lg font-semibold tracking-tight text-white sm:p-8">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 font-mono-brand text-sm text-indigo-300 ring-1 ring-white/15">
            {"</>"}
          </span>
          Johir
        </div>
      </Link>

      {/* Centered content: tagline + card, single page */}
      <div className="relative z-10 flex min-h-[calc(100vh-88px)] w-full items-center justify-center px-6 py-8 sm:px-10">
        <div className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1fr_auto]">
          {/* Login card, sitting inside the dark background */}
          <div className="w-full max-w-sm justify-self-center rounded-2xl border border-white/10 bg-white p-6 shadow-2xl shadow-black/40 sm:p-8">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold text-[#1C1B2E]">
                Welcome back
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Enter your credentials to access the dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="email"
                    type="text"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-3 text-sm text-[#1C1B2E] outline-none transition placeholder:text-gray-400 focus:ring-4 ${
                      submitted && errors.email
                        ? "border-red-400 focus:ring-red-100"
                        : "border-gray-200 focus:border-indigo-400 focus:ring-indigo-100"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-10 text-sm text-[#1C1B2E] outline-none transition placeholder:text-gray-400 focus:ring-4 ${
                      submitted && errors.password
                        ? "border-red-400 focus:ring-red-100"
                        : "border-gray-200 focus:border-indigo-400 focus:ring-indigo-100"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
                  >
                    {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Captcha */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Verification code
                </label>
                <div className="flex items-center gap-2">
                  <div className="font-mono-brand flex-1 select-none rounded-xl border border-dashed border-indigo-200 bg-indigo-50/60 px-4 py-2.5 text-center text-base font-semibold tracking-[0.35em] text-indigo-700">
                    {captcha}
                  </div>
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    aria-label="Refresh captcha"
                    className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:border-indigo-300 hover:text-indigo-600"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>

                <input
                  type="text"
                  value={captchaInput}
                  onChange={handleCaptchaChange}
                  placeholder="Type the code above"
                  className={`mt-2 w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-[#1C1B2E] outline-none transition placeholder:text-gray-400 focus:ring-4 ${
                    submitted && errors.captcha
                      ? "border-red-400 focus:ring-red-100"
                      : "border-gray-200 focus:border-indigo-400 focus:ring-indigo-100"
                  }`}
                />
                {errors.captcha && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.captcha}
                  </p>
                )}
              </div>

              {/* Remember me */}
              <label className="flex select-none items-center gap-2 text-sm text-gray-500">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-400"
                />
                Keep me signed in
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:shadow-indigo-600/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-gray-400">
              johir.coders24.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
