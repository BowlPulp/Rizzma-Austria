"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import { apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/format-price";
import OrderStatusBadge from "./OrderStatusBadge";
import {
  ClipboardList,
  Loader2,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Calendar,
  MapPin,
  Truck,
  Store,
} from "lucide-react";

type OrderItem = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type Order = {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  status: string;
  orderType: "delivery" | "pickup";
  deliveryAddress?: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  specialInstructions?: string;
  createdAt: string;
};

export default function OrdersContent() {
  const t = useTranslations("OrdersPage");
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await apiFetch<Order[]>("/orders");
      setOrders(data);
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?returnUrl=/orders");
      return;
    }

    if (user) {
      fetchOrders();
    }
  }, [authLoading, user, router, fetchOrders]);

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (authLoading || isLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-red-600" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">
          {t("subtitle")}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white py-16 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
            <ClipboardList size={28} className="text-neutral-400" />
          </div>
          <h2 className="text-lg font-semibold">{t("emptyTitle")}</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {t("emptyDescription")}
          </p>
          <Link
            href="/menu"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <ShoppingBag size={18} />
            {t("browseMenu")}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedId === order._id;

            return (
              <div
                key={order._id}
                className="rounded-2xl border border-neutral-200 bg-white transition dark:border-neutral-800 dark:bg-neutral-900"
              >
                {/* Order Header */}
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : order._id)
                  }
                  className="flex w-full items-center gap-4 p-5 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-red-600">
                        #{order.orderNumber}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(order.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        {order.orderType === "delivery" ? (
                          <Truck size={12} />
                        ) : (
                          <Store size={12} />
                        )}
                        {t(
                          order.orderType === "delivery"
                            ? "delivery"
                            : "pickup",
                        )}
                      </span>
                      <span>
                        {order.items.length}{" "}
                        {order.items.length === 1
                          ? t("item")
                          : t("items")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">
                      {formatPrice(order.total)}
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={18} className="text-neutral-400" />
                    ) : (
                      <ChevronDown size={18} className="text-neutral-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-neutral-100 px-5 pb-5 dark:border-neutral-800">
                    {/* Items */}
                    <div className="mt-4 space-y-3">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3"
                        >
                          {item.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.image}
                              alt={item.name}
                              className="size-12 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {item.quantity} × {formatPrice(item.price)}
                            </p>
                          </div>
                          <p className="text-sm font-semibold">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Address */}
                    {order.deliveryAddress && (
                      <div className="mt-4 flex items-start gap-2 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/50">
                        <MapPin
                          size={16}
                          className="mt-0.5 shrink-0 text-neutral-400"
                        />
                        <p className="text-sm text-neutral-600 dark:text-neutral-300">
                          {order.deliveryAddress}
                        </p>
                      </div>
                    )}

                    {/* Special Instructions */}
                    {order.specialInstructions && (
                      <div className="mt-3 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/50">
                        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                          {t("specialInstructions")}
                        </p>
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                          {order.specialInstructions}
                        </p>
                      </div>
                    )}

                    {/* Price Breakdown */}
                    <div className="mt-4 space-y-1.5 border-t border-neutral-100 pt-4 text-sm dark:border-neutral-800">
                      <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                        <span>{t("subtotal")}</span>
                        <span>{formatPrice(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                        <span>{t("deliveryFee")}</span>
                        <span>
                          {order.deliveryFee === 0
                            ? t("free")
                            : formatPrice(order.deliveryFee)}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>{t("total")}</span>
                        <span>{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
