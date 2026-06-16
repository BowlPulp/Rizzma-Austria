"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Flame, Leaf, Loader2, Plus, Search, Star, X } from "lucide-react";
import { useCart } from "@/app/providers/CartProvider";
import {
  useMenuCatalog,
  type CatalogItem,
} from "@/app/providers/MenuCatalogProvider";
import { formatPrice } from "@/lib/format-price";

function MenuItemCard({ item }: { item: CatalogItem }) {
  const t = useTranslations("MenuPage");
  const { requestAddItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  function handleAddToCart() {
    requestAddItem(item.slug);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {item.popular && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white">
              <Star size={12} fill="currentColor" />
              {t("badges.popular")}
            </span>
          )}
          {item.spicy && (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2.5 py-1 text-xs font-semibold text-white">
              <Flame size={12} />
              {t("badges.spicy")}
            </span>
          )}
          {item.vegetarian && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-600 px-2.5 py-1 text-xs font-semibold text-white">
              <Leaf size={12} />
              {t("badges.vegetarian")}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold leading-tight">{item.name}</h3>
          <span className="shrink-0 text-lg font-black text-red-600">
            {formatPrice(item.price)}
          </span>
        </div>

        <p className="mb-5 flex-1 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          {item.description}
        </p>

        <button
          type="button"
          onClick={handleAddToCart}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition ${
            justAdded
              ? "bg-green-600 hover:bg-green-600"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {justAdded ? <Check size={18} /> : <Plus size={18} />}
          {justAdded ? t("addedToCart") : t("addToCart")}
        </button>
      </div>
    </article>
  );
}

type MenuContentProps = {
  initialSearch?: string;
};

export default function MenuContent({ initialSearch = "" }: MenuContentProps) {
  const t = useTranslations("MenuPage");
  const { items, categories, isLoading } = useMenuCatalog();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  useEffect(() => {
    setSearchQuery(initialSearch);
  }, [initialSearch]);

  const categoryNames = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((cat) => map.set(cat.slug, cat.name));
    return map;
  }, [categories]);

  const filteredItems = useMemo(() => {
    const categoryItems =
      activeFilter === "all"
        ? items
        : items.filter((item) => item.category === activeFilter);

    const query = searchQuery.trim().toLowerCase();
    if (!query) return categoryItems;

    return categoryItems.filter((item) => {
      const categoryLabel = (
        categoryNames.get(item.category) ?? item.category
      ).toLowerCase();

      return (
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        categoryLabel.includes(query)
      );
    });
  }, [activeFilter, searchQuery, items, categoryNames]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <>
      <section className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <span className="inline-flex rounded-full bg-red-100 px-4 py-1.5 text-sm font-semibold text-red-700 dark:bg-red-950 dark:text-red-400">
            {t("eyebrow")}
          </span>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
            {t("subtitle")}
          </p>

          <div className="relative mt-8 max-w-xl">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              size={20}
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchLabel")}
              className="w-full rounded-2xl border border-neutral-300 bg-white py-4 pl-12 pr-12 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-neutral-700 dark:bg-neutral-900"
            />
            {isSearching && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-white"
                aria-label={t("clearSearch")}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="sticky top-16 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95 sm:top-20">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                activeFilter === "all"
                  ? "bg-red-600 text-white shadow-md shadow-red-600/25"
                  : "bg-neutral-100 text-neutral-700 hover:bg-red-50 hover:text-red-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-red-950 dark:hover:text-red-400"
              }`}
            >
              {t("filters.all")}
            </button>
            {categories.map((category) => (
              <button
                key={category.slug}
                type="button"
                onClick={() => setActiveFilter(category.slug)}
                className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  activeFilter === category.slug
                    ? "bg-red-600 text-white shadow-md shadow-red-600/25"
                    : "bg-neutral-100 text-neutral-700 hover:bg-red-50 hover:text-red-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-red-950 dark:hover:text-red-400"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            {isSearching
              ? t("searchResults", {
                  count: filteredItems.length,
                  query: searchQuery.trim(),
                })
              : t("itemCount", { count: filteredItems.length })}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={32} className="animate-spin text-red-600" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 px-6 py-16 text-center dark:border-neutral-700">
            <p className="text-lg font-semibold">
              {isSearching ? t("searchNoResultsTitle") : t("emptyTitle")}
            </p>
            <p className="mt-2 text-neutral-500 dark:text-neutral-400">
              {isSearching ? t("searchNoResultsDescription") : t("emptyDescription")}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <MenuItemCard key={item.slug} item={item} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
