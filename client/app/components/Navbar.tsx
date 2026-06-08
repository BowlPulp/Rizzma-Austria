"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { Menu, X } from "lucide-react";
import LocaleSwitcher from "./LocaleSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";
import CartButton from "./cart/CartButton";

const navLinks = [
  { href: "/", key: "home" },
  { href: "/menu", key: "menu" },
  { href: "/reviews", key: "reviews" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const;

export default function Navbar() {
  const t = useTranslations("Navbar");
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6">
        <Link
          href="/"
          className="text-2xl font-black tracking-tight text-red-600 sm:text-3xl"
        >
          RIZZMA
        </Link>

        <nav className="hidden items-center gap-8 font-medium md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname === link.href
                  ? "text-red-600"
                  : "transition hover:text-red-600"
              }
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex md:items-center md:gap-3">
            <ThemeSwitcher />
            <LocaleSwitcher />
            <button
              type="button"
              className="rounded-full border border-neutral-300 px-4 py-2 transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              {t("login")}
            </button>
          </div>

          <CartButton />

          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            className="inline-flex size-10 items-center justify-center rounded-full border border-neutral-300 transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800 md:hidden"
            aria-expanded={isOpen}
            aria-label={isOpen ? t("closeMenu") : t("openMenu")}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 top-16 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-none" />

          <div
            className="relative border-b border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-950"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="mx-auto max-w-7xl px-4 py-3">
              <ul className="flex flex-col">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;

                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`block rounded-xl px-4 py-3.5 text-base font-semibold transition ${
                          isActive
                            ? "bg-red-50 text-red-600 dark:bg-red-950/50"
                            : "hover:bg-neutral-100 dark:hover:bg-neutral-900"
                        }`}
                      >
                        {t(link.key)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="border-t border-neutral-200 px-4 py-4 dark:border-neutral-800">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  {t("appearance")}
                </span>
                <ThemeSwitcher />
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  {t("language")}
                </span>
                <LocaleSwitcher variant="mobile" />
              </div>

              <button
                type="button"
                className="mt-4 w-full rounded-xl border border-neutral-300 py-3.5 text-sm font-semibold transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
              >
                {t("login")}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}