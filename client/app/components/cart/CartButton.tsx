"use client";

import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCart } from "@/app/providers/CartProvider";

export default function CartButton() {
  const t = useTranslations("Cart");
  const { openCart, totalItems } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      className="relative rounded-full bg-red-600 p-3 text-white transition hover:bg-red-700"
      aria-label={t("open")}
    >
      <ShoppingBag size={20} />
      {totalItems > 0 && (
        <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-black text-xs text-white">
          {totalItems > 9 ? "9+" : totalItems}
        </span>
      )}
    </button>
  );
}
