"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { XCircle, ShoppingBag, ArrowLeft } from "lucide-react";

export default function CheckoutCancel() {
  const t = useTranslations("CheckoutPage");

  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
          <XCircle size={48} className="text-amber-600 dark:text-amber-400" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("cancelTitle")}
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {t("cancelSubtitle")}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/checkout"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <ArrowLeft size={18} />
            {t("returnToCheckout")}
          </Link>
          <Link
            href="/menu"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 px-6 py-3 text-sm font-semibold transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            <ShoppingBag size={18} />
            {t("backToMenu")}
          </Link>
        </div>
      </div>
    </main>
  );
}
