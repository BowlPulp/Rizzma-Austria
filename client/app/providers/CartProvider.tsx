"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getMenuItemById } from "@/lib/menu-data";
import type { DeliveryLocation } from "@/lib/geolocation";
import CartDrawer from "../components/cart/CartDrawer";
import LocationPrompt from "../components/cart/LocationPrompt";

const CART_STORAGE_KEY = "rizzma-cart";
const LOCATION_STORAGE_KEY = "rizzma-delivery-location";

export type CartLineItem = {
  id: string;
  quantity: number;
};

type CartContextValue = {
  items: CartLineItem[];
  deliveryLocation: DeliveryLocation | null;
  isOpen: boolean;
  isLocationPromptOpen: boolean;
  pendingItemId: string | null;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  openLocationPrompt: () => void;
  closeLocationPrompt: () => void;
  setDeliveryLocation: (location: DeliveryLocation) => void;
  clearDeliveryLocation: () => void;
  requestAddItem: (id: string) => void;
  addItem: (id: string) => void;
  removeItem: (id: string) => void;
  incrementItem: (id: string) => void;
  decrementItem: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartLineItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLineItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readStoredLocation(): DeliveryLocation | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(LOCATION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DeliveryLocation;
  } catch {
    return null;
  }
}

export default function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [deliveryLocation, setDeliveryLocationState] =
    useState<DeliveryLocation | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLocationPromptOpen, setIsLocationPromptOpen] = useState(false);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readStoredCart());
    setDeliveryLocationState(readStoredLocation());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    if (!hydrated) return;

    if (deliveryLocation) {
      window.localStorage.setItem(
        LOCATION_STORAGE_KEY,
        JSON.stringify(deliveryLocation),
      );
    } else {
      window.localStorage.removeItem(LOCATION_STORAGE_KEY);
    }
  }, [deliveryLocation, hydrated]);

  const addItem = useCallback((id: string) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === id);
      if (existing) {
        return current.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...current, { id, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const incrementItem = useCallback((id: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  }, []);

  const decrementItem = useCallback((id: string) => {
    setItems((current) =>
      current
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((open) => !open), []);

  const openLocationPrompt = useCallback(() => setIsLocationPromptOpen(true), []);
  const closeLocationPrompt = useCallback(() => {
    setIsLocationPromptOpen(false);
    setPendingItemId(null);
  }, []);

  const setDeliveryLocation = useCallback(
    (location: DeliveryLocation) => {
      setDeliveryLocationState(location);

      if (pendingItemId) {
        addItem(pendingItemId);
        setPendingItemId(null);
        setIsOpen(true);
      }
    },
    [pendingItemId, addItem],
  );

  const clearDeliveryLocation = useCallback(() => {
    setDeliveryLocationState(null);
  }, []);

  const requestAddItem = useCallback(
    (id: string) => {
      if (!deliveryLocation) {
        setPendingItemId(id);
        setIsLocationPromptOpen(true);
        return;
      }

      addItem(id);
      setIsOpen(true);
    },
    [deliveryLocation, addItem],
  );

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () =>
      items.reduce((sum, line) => {
        const menuItem = getMenuItemById(line.id);
        return sum + (menuItem?.price ?? 0) * line.quantity;
      }, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      deliveryLocation,
      isOpen,
      isLocationPromptOpen,
      pendingItemId,
      openCart,
      closeCart,
      toggleCart,
      openLocationPrompt,
      closeLocationPrompt,
      setDeliveryLocation,
      clearDeliveryLocation,
      requestAddItem,
      addItem,
      removeItem,
      incrementItem,
      decrementItem,
      clearCart,
      totalItems,
      subtotal,
    }),
    [
      items,
      deliveryLocation,
      isOpen,
      isLocationPromptOpen,
      pendingItemId,
      openCart,
      closeCart,
      toggleCart,
      openLocationPrompt,
      closeLocationPrompt,
      setDeliveryLocation,
      clearDeliveryLocation,
      requestAddItem,
      addItem,
      removeItem,
      incrementItem,
      decrementItem,
      clearCart,
      totalItems,
      subtotal,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
      <LocationPrompt />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
