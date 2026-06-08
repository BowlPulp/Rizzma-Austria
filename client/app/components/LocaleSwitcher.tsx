"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function onChange(nextLocale: string) {
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <select
      value={locale}
      onChange={(event) => onChange(event.target.value)}
      className="hidden md:block px-3 py-2 rounded-full border border-neutral-300 bg-white text-sm font-medium hover:bg-neutral-100 transition cursor-pointer dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
      aria-label="Language"
    >
      {routing.locales.map((loc) => (
        <option key={loc} value={loc}>
          {loc.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
