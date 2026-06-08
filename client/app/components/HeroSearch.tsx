"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Search } from "lucide-react";

export default function HeroSearch() {
  const t = useTranslations("Hero");
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();

    if (trimmed) {
      router.push(`/menu?search=${encodeURIComponent(trimmed)}`);
      return;
    }

    router.push("/menu");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl dark:bg-neutral-900 md:flex-row"
    >
      <div className="flex flex-1 items-center px-4">
        <Search className="text-neutral-400" size={20} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full bg-transparent p-3 outline-none dark:text-white dark:placeholder:text-neutral-400"
        />
      </div>

      <button
        type="submit"
        className="rounded-xl bg-red-600 px-8 py-4 text-center font-semibold text-white transition hover:bg-red-700"
      >
        {t("orderNow")}
      </button>
    </form>
  );
}
