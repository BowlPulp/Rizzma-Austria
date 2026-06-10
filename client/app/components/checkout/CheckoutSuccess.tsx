"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/app/providers/CartProvider";
import { apiFetch } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import { CheckCircle, ShoppingBag, ClipboardList, Loader2 } from "lucide-react";

type OrderData = {
  orderNumber: string;
  total: number;
};

export default function CheckoutSuccess() {
  const t = useTranslations("CheckoutPage");
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const sessionId = searchParams.get("session_id");

  const fetchOrder = useCallback(async () => {
    if (!sessionId) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await apiFetch<OrderData>(
        `/checkout/verify-session?session_id=${sessionId}`,
      );
      setOrder(data);
    } catch {
      // Even if we can't fetch the order, show success
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    clearCart();
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        {/* Animated Checkmark */}
        <div className="relative mx-auto mb-6 flex size-24 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-green-400/30" />
          <div className="relative flex size-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
            <CheckCircle
              size={48}
              className="text-green-600 dark:text-green-400"
            />
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("successTitle")}
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {t("successSubtitle")}
        </p>

        {isLoading ? (
          <div className="mt-6 flex justify-center">
            <Loader2 size={24} className="animate-spin text-neutral-400" />
          </div>
        ) : order ? (
          <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {t("orderNumber")}
            </p>
            <p className="mt-1 text-xl font-bold tracking-wide text-red-600">
              #{order.orderNumber}
            </p>
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/orders"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <ClipboardList size={18} />
            {t("viewOrders")}
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
