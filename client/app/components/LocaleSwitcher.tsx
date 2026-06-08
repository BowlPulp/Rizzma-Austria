"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

type LocaleSwitcherProps = {
  variant?: "desktop" | "mobile";
};

export default function LocaleSwitcher({
  variant = "desktop",
}: LocaleSwitcherProps) {
  const t = useTranslations("Navbar");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function onChange(nextLocale: string) {
    router.replace(pathname, { locale: nextLocale });
  }

  const baseClassName =
    "rounded-full border border-neutral-300 bg-white px-3 py-2 text-sm font-medium transition cursor-pointer hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800";

  if (variant === "mobile") {
    return (
      <select
        value={locale}
        onChange={(event) => onChange(event.target.value)}
        className={baseClassName}
        aria-label={t("language")}
      >
        {routing.locales.map((loc) => (
          <option key={loc} value={loc}>
            {loc.toUpperCase()}
          </option>
        ))}
      </select>
    );
  }

  return (
    <select
      value={locale}
      onChange={(event) => onChange(event.target.value)}
      className={`hidden md:block ${baseClassName}`}
      aria-label={t("language")}
    >
      {routing.locales.map((loc) => (
        <option key={loc} value={loc}>
          {loc.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
