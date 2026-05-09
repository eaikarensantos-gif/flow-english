"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Library" },
  { href: "/vocab", label: "Vocabulary" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-bg/90 backdrop-blur-md border-b border-white/5 flex items-center px-4 md:px-8">
      <Link href="/" className="text-accent font-bold text-lg tracking-tight mr-auto">
        Flow English
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-medium transition-colors ${
              pathname === link.href
                ? "text-accent border-b-2 border-accent pb-0.5"
                : "text-white/60 hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden text-white/60 hover:text-white ml-auto"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden absolute top-14 left-0 right-0 bg-bg-card border-b border-white/5 py-4 px-4 flex flex-col gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`text-sm font-medium py-2 ${
                pathname === link.href ? "text-accent" : "text-white/70"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
