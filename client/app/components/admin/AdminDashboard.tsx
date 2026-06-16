"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import { apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/format-price";
import OrderStatusBadge from "../orders/OrderStatusBadge";
import {
  Loader2,
  ShoppingCart,
  DollarSign,
  Clock,
  Package,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  UtensilsCrossed,
  RefreshCw,
  MapPin,
  Calendar,
  User,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  X,
  Save,
} from "lucide-react";

// --- Types ---

type Stats = {
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  totalOrders: number;
};

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
  user?: {
    name: string;
    email: string;
  };
};

type AdminMenuItem = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
};

type Category = {
  _id: string;
  slug: string;
  name: string;
  order: number;
};

type Tab = "all" | "pending" | "preparing" | "ready" | "delivered";
type Section = "orders" | "menu";

const ORDER_STATUS_ACTIONS: Record<string, { next: string; label: string }[]> = {
  pending: [{ next: "confirmed", label: "confirm" }],
  confirmed: [{ next: "preparing", label: "startPreparing" }],
  preparing: [{ next: "ready", label: "markReady" }],
  ready: [
    { next: "out_for_delivery", label: "outForDelivery" },
    { next: "picked_up", label: "markPickedUp" },
  ],
  out_for_delivery: [{ next: "delivered", label: "markDelivered" }],
};

export default function AdminDashboard() {
  const t = useTranslations("AdminPage");
  const router = useRouter();
  const { user, isAdmin, isLoading: authLoading } = useAuth();

  const [section, setSection] = useState<Section>("orders");
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<AdminMenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Menu editing state
  const [editingItem, setEditingItem] = useState<AdminMenuItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    available: true,
  });

  const fetchStats = useCallback(async () => {
    try {
      const data = await apiFetch<{ stats: Stats }>("/admin/stats");
      setStats(data.stats);
    } catch {
      /* silently fail */
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await apiFetch<{ orders: Order[] }>("/admin/orders");
      setOrders(data.orders);
    } catch {
      setOrders([]);
    }
  }, []);

  const fetchMenuItems = useCallback(async () => {
    try {
      const data = await apiFetch<{ items: AdminMenuItem[] }>("/menu?available=false");
      setMenuItems(data.items);
    } catch {
      setMenuItems([]);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await apiFetch<{ categories: Category[] }>("/admin/categories");
      setCategories(data.categories);
    } catch {
      setCategories([]);
    }
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      fetchStats(),
      fetchOrders(),
      fetchMenuItems(),
      fetchCategories(),
    ]);
    setIsLoading(false);
  }, [fetchStats, fetchOrders, fetchMenuItems, fetchCategories]);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push("/");
      return;
    }

    if (user && isAdmin) {
      loadData();
    }
  }, [authLoading, user, isAdmin, router, loadData]);

  async function handleRefresh() {
    setIsRefreshing(true);
    await Promise.all([
      fetchStats(),
      fetchOrders(),
      fetchMenuItems(),
      fetchCategories(),
    ]);
    setIsRefreshing(false);
  }

  async function handleStatusUpdate(orderId: string, newStatus: string) {
    setUpdatingOrderId(orderId);
    try {
      await apiFetch(`/admin/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchOrders();
      await fetchStats();
    } catch {
      /* silently fail */
    } finally {
      setUpdatingOrderId(null);
    }
  }

  async function handleToggleAvailability(itemId: string, available: boolean) {
    try {
      await apiFetch(`/admin/menu/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify({ available: !available }),
      });
      await fetchMenuItems();
    } catch {
      /* silently fail */
    }
  }

  async function handleDeleteMenuItem(itemId: string) {
    try {
      await apiFetch(`/admin/menu/${itemId}`, { method: "DELETE" });
      await fetchMenuItems();
    } catch {
      /* silently fail */
    }
  }

  const [addError, setAddError] = useState("");

  async function handleAddMenuItem() {
    setAddError("");
    if (!newItem.name.trim()) {
      setAddError(t("itemName"));
      return;
    }
    if (!newItem.category) {
      setAddError(t("itemCategory"));
      return;
    }
    try {
      await apiFetch("/admin/menu", {
        method: "POST",
        body: JSON.stringify({
          ...newItem,
          price: parseFloat(newItem.price),
        }),
      });
      setShowAddForm(false);
      setNewItem({
        name: "",
        description: "",
        price: "",
        category: "",
        image: "",
        available: true,
      });
      await fetchMenuItems();
    } catch (err) {
      setAddError(
        err instanceof Error ? err.message : t("saveItem"),
      );
    }
  }

  async function handleAddCategory() {
    setCategoryError("");
    if (!newCategoryName.trim()) return;
    try {
      await apiFetch("/admin/categories", {
        method: "POST",
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      setNewCategoryName("");
      await fetchCategories();
    } catch (err) {
      setCategoryError(
        err instanceof Error ? err.message : t("addCategory"),
      );
    }
  }

  async function handleDeleteCategory(categoryId: string) {
    setCategoryError("");
    try {
      await apiFetch(`/admin/categories/${categoryId}`, { method: "DELETE" });
      await fetchCategories();
    } catch (err) {
      setCategoryError(
        err instanceof Error ? err.message : t("deleteCategory"),
      );
    }
  }

  async function handleUpdateMenuItem() {
    if (!editingItem) return;

    try {
      await apiFetch(`/admin/menu/${editingItem._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editingItem.name,
          description: editingItem.description,
          price: editingItem.price,
          category: editingItem.category,
          image: editingItem.image,
          available: editingItem.available,
        }),
      });
      setEditingItem(null);
      await fetchMenuItems();
    } catch {
      /* silently fail */
    }
  }

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    if (activeTab === "delivered")
      return ["delivered", "picked_up"].includes(order.status);
    return order.status === activeTab;
  });

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
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

  const tabs: Tab[] = ["all", "pending", "preparing", "ready", "delivered"];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("title")}
          </h1>
          <p className="mt-1 text-neutral-500 dark:text-neutral-400">
            {t("subtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-medium transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          <RefreshCw
            size={16}
            className={isRefreshing ? "animate-spin" : ""}
          />
          {t("refresh")}
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatsCard
            icon={<ShoppingCart size={22} />}
            label={t("todayOrders")}
            value={String(stats.todayOrders)}
            gradient="from-red-500 to-rose-600"
          />
          <StatsCard
            icon={<DollarSign size={22} />}
            label={t("todayRevenue")}
            value={formatPrice(stats.todayRevenue)}
            gradient="from-emerald-500 to-green-600"
          />
          <StatsCard
            icon={<Clock size={22} />}
            label={t("pendingOrders")}
            value={String(stats.pendingOrders)}
            gradient="from-amber-500 to-orange-600"
          />
          <StatsCard
            icon={<Package size={22} />}
            label={t("totalOrders")}
            value={String(stats.totalOrders)}
            gradient="from-blue-500 to-indigo-600"
          />
        </div>
      )}

      {/* Section Toggle */}
      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setSection("orders")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            section === "orders"
              ? "bg-red-600 text-white"
              : "border border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          }`}
        >
          <LayoutDashboard size={16} />
          {t("ordersSection")}
        </button>
        <button
          type="button"
          onClick={() => setSection("menu")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            section === "menu"
              ? "bg-red-600 text-white"
              : "border border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          }`}
        >
          <UtensilsCrossed size={16} />
          {t("menuSection")}
        </button>
      </div>

      {/* Orders Section */}
      {section === "orders" && (
        <>
          {/* Tabs */}
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  activeTab === tab
                    ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                    : "text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                }`}
              >
                {t(`tabs.${tab}`)}
              </button>
            ))}
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-white py-16 text-center dark:border-neutral-800 dark:bg-neutral-900">
              <p className="text-neutral-500 dark:text-neutral-400">
                {t("noOrders")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const isExpanded = expandedOrderId === order._id;
                const statusActions =
                  ORDER_STATUS_ACTIONS[order.status] || [];

                return (
                  <div
                    key={order._id}
                    className="rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    {/* Order Row */}
                    <div className="flex items-center gap-3 p-4 sm:p-5">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedOrderId(
                            isExpanded ? null : order._id,
                          )
                        }
                        className="flex flex-1 items-center gap-3 text-left min-w-0"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-red-600">
                              #{order.orderNumber}
                            </span>
                            <OrderStatusBadge status={order.status} />
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                            {order.user && (
                              <span className="flex items-center gap-1">
                                <User size={11} />
                                {order.user.name}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar size={11} />
                              {formatDate(order.createdAt)}
                            </span>
                            <span>
                              {order.items
                                .map(
                                  (i) =>
                                    `${i.quantity}× ${i.name}`,
                                )
                                .join(", ")}
                            </span>
                          </div>
                        </div>

                        <span className="font-bold">
                          {formatPrice(order.total)}
                        </span>
                        {isExpanded ? (
                          <ChevronUp
                            size={18}
                            className="text-neutral-400 shrink-0"
                          />
                        ) : (
                          <ChevronDown
                            size={18}
                            className="text-neutral-400 shrink-0"
                          />
                        )}
                      </button>
                    </div>

                    {/* Expanded */}
                    {isExpanded && (
                      <div className="border-t border-neutral-100 px-4 pb-5 sm:px-5 dark:border-neutral-800">
                        {/* Items */}
                        <div className="mt-4 space-y-2">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 text-sm"
                            >
                              {item.image && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="size-10 rounded-lg object-cover"
                                />
                              )}
                              <span className="flex-1">
                                {item.quantity}× {item.name}
                              </span>
                              <span className="font-medium">
                                {formatPrice(
                                  item.price * item.quantity,
                                )}
                              </span>
                            </div>
                          ))}
                        </div>

                        {order.deliveryAddress && (
                          <div className="mt-3 flex items-start gap-2 rounded-xl bg-neutral-50 p-3 text-sm dark:bg-neutral-800/50">
                            <MapPin
                              size={14}
                              className="mt-0.5 shrink-0 text-neutral-400"
                            />
                            <span>{order.deliveryAddress}</span>
                          </div>
                        )}

                        {order.specialInstructions && (
                          <div className="mt-2 rounded-xl bg-neutral-50 p-3 text-sm dark:bg-neutral-800/50">
                            <span className="font-medium">
                              {t("instructions")}:
                            </span>{" "}
                            {order.specialInstructions}
                          </div>
                        )}

                        {/* Status Actions */}
                        {statusActions.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {statusActions.map((action) => (
                              <button
                                key={action.next}
                                type="button"
                                onClick={() =>
                                  handleStatusUpdate(
                                    order._id,
                                    action.next,
                                  )
                                }
                                disabled={
                                  updatingOrderId === order._id
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                              >
                                {updatingOrderId === order._id ? (
                                  <Loader2
                                    size={14}
                                    className="animate-spin"
                                  />
                                ) : null}
                                {t(`actions.${action.label}`)}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Menu Management Section */}
      {section === "menu" && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t("menuManagement")}</h2>
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              <Plus size={16} />
              {t("addItem")}
            </button>
          </div>

          {/* Category Management */}
          <div className="mb-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-3 font-semibold">{t("categories")}</h3>
            <div className="mb-3 flex flex-wrap gap-2">
              {categories.length === 0 ? (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {t("noCategories")}
                </p>
              ) : (
                categories.map((cat) => (
                  <span
                    key={cat.slug}
                    className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 py-1 pl-3 pr-1.5 text-sm dark:bg-neutral-800"
                  >
                    {cat.name}
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat._id)}
                      className="flex size-5 items-center justify-center rounded-full text-neutral-400 transition hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950"
                      title={t("deleteCategory")}
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t("categoryName")}
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddCategory();
                }}
                className="flex-1 rounded-xl border border-neutral-300 bg-transparent px-3 py-2.5 text-sm dark:border-neutral-700"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
              >
                <Plus size={16} />
                {t("addCategory")}
              </button>
            </div>
            {categoryError && (
              <p className="mt-3 text-sm text-red-600">{categoryError}</p>
            )}
          </div>

          {/* Add New Item Form */}
          {showAddForm && (
            <div className="mb-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">{t("newItem")}</h3>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder={t("itemName")}
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  className="rounded-xl border border-neutral-300 bg-transparent px-3 py-2.5 text-sm dark:border-neutral-700"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder={t("itemPrice")}
                  value={newItem.price}
                  onChange={(e) =>
                    setNewItem({ ...newItem, price: e.target.value })
                  }
                  className="rounded-xl border border-neutral-300 bg-transparent px-3 py-2.5 text-sm dark:border-neutral-700"
                />
                <input
                  type="text"
                  placeholder={t("itemImage")}
                  value={newItem.image}
                  onChange={(e) =>
                    setNewItem({ ...newItem, image: e.target.value })
                  }
                  className="rounded-xl border border-neutral-300 bg-transparent px-3 py-2.5 text-sm dark:border-neutral-700"
                />
                <select
                  value={newItem.category}
                  onChange={(e) =>
                    setNewItem({ ...newItem, category: e.target.value })
                  }
                  className="rounded-xl border border-neutral-300 bg-transparent px-3 py-2.5 text-sm dark:border-neutral-700"
                >
                  <option value="" disabled>
                    {t("itemCategory")}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <textarea
                  placeholder={t("itemDescription")}
                  value={newItem.description}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      description: e.target.value,
                    })
                  }
                  rows={2}
                  className="rounded-xl border border-neutral-300 bg-transparent px-3 py-2.5 text-sm sm:col-span-2 dark:border-neutral-700"
                />
              </div>
              {addError && (
                <p className="mt-3 text-sm text-red-600">{addError}</p>
              )}
              <button
                type="button"
                onClick={handleAddMenuItem}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                <Save size={16} />
                {t("saveItem")}
              </button>
            </div>
          )}

          {/* Edit Item Form */}
          {editingItem && (
            <div className="mb-4 rounded-2xl border border-blue-200 bg-blue-50/50 p-5 dark:border-blue-900 dark:bg-blue-950/20">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">{t("editItem")}</h3>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder={t("itemName")}
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      name: e.target.value,
                    })
                  }
                  className="rounded-xl border border-neutral-300 bg-transparent px-3 py-2.5 text-sm dark:border-neutral-700"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder={t("itemPrice")}
                  value={editingItem.price}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="rounded-xl border border-neutral-300 bg-transparent px-3 py-2.5 text-sm dark:border-neutral-700"
                />
                <input
                  type="text"
                  placeholder={t("itemImage")}
                  value={editingItem.image}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      image: e.target.value,
                    })
                  }
                  className="rounded-xl border border-neutral-300 bg-transparent px-3 py-2.5 text-sm dark:border-neutral-700"
                />
                <select
                  value={editingItem.category}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      category: e.target.value,
                    })
                  }
                  className="rounded-xl border border-neutral-300 bg-transparent px-3 py-2.5 text-sm dark:border-neutral-700"
                >
                  {!categories.some(
                    (cat) => cat.slug === editingItem.category,
                  ) && (
                    <option value={editingItem.category}>
                      {editingItem.category}
                    </option>
                  )}
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <textarea
                  placeholder={t("itemDescription")}
                  value={editingItem.description}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      description: e.target.value,
                    })
                  }
                  rows={2}
                  className="rounded-xl border border-neutral-300 bg-transparent px-3 py-2.5 text-sm sm:col-span-2 dark:border-neutral-700"
                />
              </div>
              <button
                type="button"
                onClick={handleUpdateMenuItem}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Save size={16} />
                {t("updateItem")}
              </button>
            </div>
          )}

          {/* Menu Items List */}
          {menuItems.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-white py-16 text-center dark:border-neutral-800 dark:bg-neutral-900">
              <p className="text-neutral-500 dark:text-neutral-400">
                {t("noMenuItems")}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {menuItems.map((item) => (
                <div
                  key={item._id}
                  className={`flex items-center gap-4 rounded-2xl border p-4 transition ${
                    item.available
                      ? "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
                      : "border-neutral-200/60 bg-neutral-50 opacity-60 dark:border-neutral-800/60 dark:bg-neutral-900/60"
                  }`}
                >
                  {item.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.name}
                      className="size-14 rounded-xl object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{item.name}</p>
                      <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                        {item.category}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400 truncate">
                      {item.description}
                    </p>
                  </div>
                  <span className="font-bold">
                    {formatPrice(item.price)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleAvailability(
                          item._id,
                          item.available,
                        )
                      }
                      className="flex size-9 items-center justify-center rounded-lg border border-neutral-300 transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                      title={
                        item.available
                          ? t("markUnavailable")
                          : t("markAvailable")
                      }
                    >
                      {item.available ? (
                        <Eye size={15} className="text-green-600" />
                      ) : (
                        <EyeOff size={15} className="text-neutral-400" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingItem(item)}
                      className="flex size-9 items-center justify-center rounded-lg border border-neutral-300 transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                      title={t("editItem")}
                    >
                      <UtensilsCrossed size={15} className="text-blue-600" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMenuItem(item._id)}
                      className="flex size-9 items-center justify-center rounded-lg border border-red-200 transition hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30"
                      title={t("deleteItem")}
                    >
                      <Trash2 size={15} className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

// --- Stats Card ---

function StatsCard({
  icon,
  label,
  value,
  gradient,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  gradient: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div
        className={`absolute -right-6 -top-6 size-20 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-xl`}
      />
      <div
        className={`mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white`}
      >
        {icon}
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
        {label}
      </p>
    </div>
  );
}
