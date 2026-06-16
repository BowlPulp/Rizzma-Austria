"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiFetch } from "@/lib/api";

export type CatalogItem = {
  _id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image: string;
  popular?: boolean;
  spicy?: boolean;
  vegetarian?: boolean;
  available?: boolean;
};

export type CatalogCategory = {
  _id: string;
  slug: string;
  name: string;
  order: number;
};

type MenuCatalogContextValue = {
  items: CatalogItem[];
  categories: CatalogCategory[];
  isLoading: boolean;
  error: boolean;
  getItemById: (slug: string) => CatalogItem | undefined;
  refetch: () => Promise<void>;
};

const MenuCatalogContext = createContext<MenuCatalogContextValue | null>(null);

export default function MenuCatalogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(false);
    try {
      const [menuRes, catRes] = await Promise.all([
        apiFetch<{ items: CatalogItem[] }>("/menu"),
        apiFetch<{ categories: CatalogCategory[] }>("/categories"),
      ]);
      setItems(menuRes.items ?? []);
      setCategories(catRes.categories ?? []);
    } catch {
      setError(true);
      setItems([]);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const getItemById = useCallback(
    (slug: string) => items.find((item) => item.slug === slug),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      categories,
      isLoading,
      error,
      getItemById,
      refetch: load,
    }),
    [items, categories, isLoading, error, getItemById, load],
  );

  return (
    <MenuCatalogContext.Provider value={value}>
      {children}
    </MenuCatalogContext.Provider>
  );
}

export function useMenuCatalog() {
  const context = useContext(MenuCatalogContext);
  if (!context) {
    throw new Error("useMenuCatalog must be used within MenuCatalogProvider");
  }
  return context;
}
