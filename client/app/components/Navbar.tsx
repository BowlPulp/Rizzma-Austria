"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { Menu, X, User, LogOut, ClipboardList, LayoutDashboard, ChevronDown } from "lucide-react";
import LocaleSwitcher from "./LocaleSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";
import CartButton from "./cart/CartButton";
import { useAuth } from "@/app/providers/AuthProvider";

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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, profile, isAdmin, signOut, isLoading } = useAuth();

  useEffect(() => {
    setIsOpen(false);
    setIsUserMenuOpen(false);
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

  // Close user menu on outside click
  useEffect(() => {
    if (!isUserMenuOpen) return;

    function onClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isUserMenuOpen]);

  const displayName = profile?.name || user?.email?.split("@")[0] || "";

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

            {/* Auth Section */}
            {isLoading ? (
              <div className="h-10 w-20 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
            ) : user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 rounded-full border border-neutral-300 px-3 py-2 text-sm font-medium transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                >
                  <div className="flex size-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-24 truncate">{displayName}</span>
                  <ChevronDown size={14} className={`transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-neutral-200 bg-white py-1 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
                    <Link
                      href="/orders"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    >
                      <ClipboardList size={16} className="text-neutral-500" />
                      {t("myOrders")}
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      >
                        <LayoutDashboard size={16} className="text-neutral-500" />
                        {t("adminDashboard")}
                      </Link>
                    )}
                    <div className="mx-3 my-1 h-px bg-neutral-100 dark:bg-neutral-800" />
                    <button
                      type="button"
                      onClick={() => {
                        signOut();
                        setIsUserMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/50"
                    >
                      <LogOut size={16} />
                      {t("logout")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="rounded-full border border-neutral-300 px-4 py-2 transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
              >
                {t("login")}
              </Link>
            )}
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

                {/* Mobile: Orders link */}
                {user && (
                  <li>
                    <Link
                      href="/orders"
                      onClick={() => setIsOpen(false)}
                      className={`block rounded-xl px-4 py-3.5 text-base font-semibold transition ${
                        pathname === "/orders"
                          ? "bg-red-50 text-red-600 dark:bg-red-950/50"
                          : "hover:bg-neutral-100 dark:hover:bg-neutral-900"
                      }`}
                    >
                      {t("myOrders")}
                    </Link>
                  </li>
                )}

                {/* Mobile: Admin link */}
                {isAdmin && (
                  <li>
                    <Link
                      href="/admin"
                      onClick={() => setIsOpen(false)}
                      className={`block rounded-xl px-4 py-3.5 text-base font-semibold transition ${
                        pathname === "/admin"
                          ? "bg-red-50 text-red-600 dark:bg-red-950/50"
                          : "hover:bg-neutral-100 dark:hover:bg-neutral-900"
                      }`}
                    >
                      {t("adminDashboard")}
                    </Link>
                  </li>
                )}
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

              {!isLoading && (
                user ? (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 rounded-xl bg-neutral-50 px-4 py-3 dark:bg-neutral-900">
                      <div className="flex size-8 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{displayName}</p>
                        <p className="truncate text-xs text-neutral-500">{user.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        signOut();
                        setIsOpen(false);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/50"
                    >
                      <LogOut size={16} />
                      {t("logout")}
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/auth/login"
                    onClick={() => setIsOpen(false)}
                    className="mt-4 block w-full rounded-xl border border-neutral-300 py-3.5 text-center text-sm font-semibold transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
                  >
                    {t("login")}
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}