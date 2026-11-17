"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useThemeStore } from "@/app/lib/store";

import { Sora, Playfair_Display } from "next/font/google";
import Image from "next/image";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-sora",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const navLinks = [
  { label: "Home", href: "/#home" },
  { label: "About Me", href: "/#about" },
  { label: "Projects", href: "/#projects" },
  { label: "Qualifications", href: "/qualifications" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Blog", href: "/#blog" },
  { label: "Contact", href: "/#contact" },
];

const Navbar = () => {
  const { theme, toggleTheme } = useThemeStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`navbar ${scrolled ? "navbar--scrolled" : ""} ${
        theme === "light" ? "navbar--light" : "navbar--dark"
      }`}
    >
      <div className="max-width flex w-full items-center justify-between px-0 py-3 md:px-8">
        {/* Logo */}
        <Link href="/" className="navbar__logo flex">
          <Image
            src="/Johirul-islam-rasel.png"
            width={50}
            height={50}
            alt="Md Johirul Islam Rasel - Software Engineer"
            priority
          />
        </Link>

        {/* Center Nav Links */}
        <ul className="navbar__links">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="navbar__link">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right Actions */}
        <div className="navbar__actions">
          <button
            className="navbar__theme-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link href="/start-a-project" className="navbar__hire-btn !hidden md:!flex">
            Hire Me
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            className="navbar__mobile-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar__mobile-menu">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="navbar__mobile-link"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/start-a-project"
            className="navbar__hire-btn navbar__hire-btn--mobile"
            onClick={() => setMenuOpen(false)}
          >
            Hire Me
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
