"use client";

import { useTranslations } from "next-intl";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "picked_up"
  | "cancelled";

const statusStyles: Record<OrderStatus, string> = {
  pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  confirmed:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  preparing:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  ready:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  out_for_delivery:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  delivered:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  picked_up:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  cancelled:
    "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
};

export default function OrderStatusBadge({ status }: { status: string }) {
  const t = useTranslations("OrderStatus");

  const normalizedStatus = (status as OrderStatus) || "pending";
  const style =
    statusStyles[normalizedStatus] || statusStyles.pending;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}
    >
      {t(normalizedStatus)}
    </span>
  );
}
