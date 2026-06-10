"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import { useCart } from "@/app/providers/CartProvider";
import { apiFetch } from "@/lib/api";
import { getMenuItemById } from "@/lib/menu-data";
import { formatPrice } from "@/lib/format-price";
import {
  ShoppingBag,
  Truck,
  Store,
  MapPin,
  FileText,
  CreditCard,
  Loader2,
  Minus,
  Plus,
  ArrowLeft,
  Package,
} from "lucide-react";

const DELIVERY_FEE = 2.9;

type OrderType = "delivery" | "pickup";

export default function CheckoutContent() {
  const t = useTranslations("CheckoutPage");
  const router = useRouter();
  const { user, profile, isLoading: authLoading } = useAuth();
  const {
    items,
    subtotal,
    deliveryLocation,
    incrementItem,
    decrementItem,
    removeItem,
  } = useCart();

  const [orderType, setOrderType] = useState<OrderType>("delivery");
  const [address, setAddress] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill address from delivery location or profile
  useEffect(() => {
    if (deliveryLocation?.address) {
      setAddress(deliveryLocation.address);
    } else if (profile?.address) {
      setAddress(profile.address);
    }
  }, [deliveryLocation, profile]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?returnUrl=/checkout");
    }
  }, [authLoading, user, router]);

  const deliveryFee = orderType === "delivery" ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  async function handleCheckout() {
    setError("");

    if (items.length === 0) return;

    if (orderType === "delivery" && !address.trim()) {
      setError(t("addressRequired"));
      return;
    }

    setIsSubmitting(true);

    try {
      const cartItems = items.map((item) => {
        const menuItem = getMenuItemById(item.id);
        return {
          slug: item.id,
          name: menuItem?.id || item.id,
          price: menuItem?.price || 0,
          quantity: item.quantity,
        };
      });

      const payload = {
        items: cartItems,
        type: orderType,
        deliveryAddress:
          orderType === "delivery"
            ? { address: address.trim() }
            : undefined,
        notes: instructions.trim() || undefined,
        locale: window.location.pathname.split("/")[1] || "en",
      };

      const data = await apiFetch<{ url: string }>(
        "/checkout/create-session",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-red-600" />
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
          <ShoppingBag size={32} className="text-neutral-400" />
        </div>
        <h1 className="text-2xl font-bold">{t("emptyCartTitle")}</h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {t("emptyCartDescription")}
        </p>
        <Link
          href="/menu"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          {t("browseMenu")}
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      {/* Back link */}
      <Link
        href="/menu"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-neutral-500 transition hover:text-red-600 dark:text-neutral-400"
      >
        <ArrowLeft size={16} />
        {t("backToMenu")}
      </Link>

      <h1 className="mb-8 text-2xl font-bold tracking-tight sm:text-3xl">
        {t("title")}
      </h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Order Type Toggle */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="mb-4 text-lg font-semibold">{t("orderType")}</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOrderType("delivery")}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3.5 text-sm font-semibold transition ${
                  orderType === "delivery"
                    ? "border-red-600 bg-red-50 text-red-600 dark:bg-red-950/30"
                    : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
                }`}
              >
                <Truck size={18} />
                {t("delivery")}
              </button>
              <button
                type="button"
                onClick={() => setOrderType("pickup")}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3.5 text-sm font-semibold transition ${
                  orderType === "pickup"
                    ? "border-red-600 bg-red-50 text-red-600 dark:bg-red-950/30"
                    : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
                }`}
              >
                <Store size={18} />
                {t("pickup")}
              </button>
            </div>
          </div>

          {/* Delivery Address */}
          {orderType === "delivery" && (
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <MapPin size={20} className="text-red-600" />
                {t("deliveryAddress")}
              </h2>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t("addressPlaceholder")}
                rows={3}
                className="w-full rounded-xl border border-neutral-300 bg-transparent px-4 py-3 text-sm transition placeholder:text-neutral-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-neutral-700 dark:placeholder:text-neutral-500"
              />
            </div>
          )}

          {/* Special Instructions */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <FileText size={20} className="text-red-600" />
              {t("specialInstructions")}
            </h2>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder={t("instructionsPlaceholder")}
              rows={3}
              className="w-full rounded-xl border border-neutral-300 bg-transparent px-4 py-3 text-sm transition placeholder:text-neutral-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-neutral-700 dark:placeholder:text-neutral-500"
            />
          </div>

          {/* Order Items */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Package size={20} className="text-red-600" />
              {t("orderItems")}
            </h2>
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {items.map((item) => {
                const menuItem = getMenuItemById(item.id);
                if (!menuItem) return null;
                return (
                  <li
                    key={item.id}
                    className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={menuItem.image}
                      alt={menuItem.id}
                      className="size-16 rounded-xl object-cover sm:size-20"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{menuItem.id}</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {formatPrice(menuItem.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          item.quantity === 1
                            ? removeItem(item.id)
                            : decrementItem(item.id)
                        }
                        className="flex size-8 items-center justify-center rounded-lg border border-neutral-300 transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                        aria-label={t("decrease")}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => incrementItem(item.id)}
                        className="flex size-8 items-center justify-center rounded-lg border border-neutral-300 transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                        aria-label={t("increase")}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="w-20 text-right font-semibold">
                      {formatPrice(menuItem.price * item.quantity)}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Right Column — Summary */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg shadow-neutral-200/50 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-black/20">
            <h2 className="mb-4 text-lg font-semibold">{t("summary")}</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">
                  {t("subtotal")}
                </span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">
                  {t("deliveryFee")}
                </span>
                <span className="font-semibold">
                  {deliveryFee === 0
                    ? t("free")
                    : formatPrice(deliveryFee)}
                </span>
              </div>
              <div className="h-px bg-neutral-200 dark:bg-neutral-800" />
              <div className="flex justify-between text-base font-bold">
                <span>{t("total")}</span>
                <span className="text-red-600">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:bg-red-950/50 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Pay Button */}
            <button
              type="button"
              onClick={handleCheckout}
              disabled={isSubmitting || items.length === 0}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3.5 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <CreditCard size={18} />
                  {t("payWithStripe")}
                </>
              )}
            </button>

            <p className="mt-3 text-center text-xs text-neutral-400">
              {t("securePayment")}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
