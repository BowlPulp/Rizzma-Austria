"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Minus, MapPin, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/app/providers/CartProvider";
import { getMenuItemById } from "@/lib/menu-data";
import { formatPrice } from "@/lib/format-price";

export default function CartDrawer() {
  const t = useTranslations("Cart");
  const router = useRouter();
  const menuT = useTranslations("MenuPage");
  const {
    items,
    deliveryLocation,
    isOpen,
    closeCart,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
    openLocationPrompt,
    subtotal,
    totalItems,
  } = useCart();

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeCart();
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        aria-label={t("close")}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeCart}
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-neutral-950">
        <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-5 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-red-600 text-white">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold">{t("title")}</h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {t("itemCount", { count: totalItems })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-full p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
            aria-label={t("close")}
          >
            <X size={20} />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-900">
              <ShoppingBag size={28} className="text-neutral-400" />
            </div>
            <p className="text-lg font-semibold">{t("emptyTitle")}</p>
            <p className="mt-2 max-w-xs text-sm text-neutral-500 dark:text-neutral-400">
              {t("emptyDescription")}
            </p>
            <Link
              href="/menu"
              onClick={closeCart}
              className="mt-6 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              {t("browseMenu")}
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
              {deliveryLocation ? (
                <div className="flex items-start gap-3 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-900">
                  <MapPin
                    size={18}
                    className="mt-0.5 shrink-0 text-red-600"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                      {t("deliverTo")}
                    </p>
                    <p className="mt-1 text-sm leading-snug">
                      {deliveryLocation.address}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openLocationPrompt}
                    className="shrink-0 text-xs font-semibold text-red-600 hover:underline"
                  >
                    {t("changeLocation")}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={openLocationPrompt}
                  className="flex w-full items-center gap-3 rounded-xl border border-dashed border-red-300 bg-red-50 px-4 py-3 text-left transition hover:bg-red-100 dark:border-red-900 dark:bg-red-950/50 dark:hover:bg-red-950"
                >
                  <MapPin size={18} className="shrink-0 text-red-600" />
                  <div>
                    <p className="text-sm font-semibold">{t("addLocation")}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {t("addLocationHint")}
                    </p>
                  </div>
                </button>
              )}
            </div>

            <ul className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              {items.map((line) => {
                const menuItem = getMenuItemById(line.id);
                if (!menuItem) return null;

                return (
                  <li
                    key={line.id}
                    className="flex gap-4 rounded-2xl border border-neutral-200 p-3 dark:border-neutral-800"
                  >
                    <img
                      src={menuItem.image}
                      alt={menuT(`items.${line.id}.name`)}
                      className="size-20 shrink-0 rounded-xl object-cover"
                    />

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold leading-tight">
                          {menuT(`items.${line.id}.name`)}
                        </h3>
                        <button
                          type="button"
                          onClick={() => removeItem(line.id)}
                          className="shrink-0 rounded-lg p-1 text-neutral-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                          aria-label={t("remove")}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <p className="mt-1 text-sm font-bold text-red-600">
                        {formatPrice(menuItem.price * line.quantity)}
                      </p>

                      <div className="mt-auto flex items-center gap-2 pt-3">
                        <button
                          type="button"
                          onClick={() => decrementItem(line.id)}
                          className="inline-flex size-8 items-center justify-center rounded-lg border border-neutral-300 transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                          aria-label={t("decrease")}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="min-w-6 text-center text-sm font-semibold">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => incrementItem(line.id)}
                          className="inline-flex size-8 items-center justify-center rounded-lg border border-neutral-300 transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                          aria-label={t("increase")}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <footer className="border-t border-neutral-200 px-6 py-5 dark:border-neutral-800">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">
                  {t("subtotal")}
                </span>
                <span className="text-xl font-black">{formatPrice(subtotal)}</span>
              </div>

              <p className="mb-4 text-xs text-neutral-500 dark:text-neutral-400">
                {t("deliveryNote")}
              </p>

              <button
                type="button"
                disabled={!deliveryLocation}
                onClick={() => {
                  if (!deliveryLocation) {
                    openLocationPrompt();
                  } else {
                    closeCart();
                    router.push("/checkout");
                  }
                }}
                className="w-full rounded-xl bg-red-600 py-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deliveryLocation ? t("checkout") : t("checkoutNeedsLocation")}
              </button>

              <button
                type="button"
                onClick={clearCart}
                className="mt-3 w-full py-2 text-sm font-medium text-neutral-500 transition hover:text-red-600 dark:text-neutral-400"
              >
                {t("clearCart")}
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
