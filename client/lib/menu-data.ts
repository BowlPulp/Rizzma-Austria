export type MenuCategory = "pizza" | "burgers" | "salads";

export type MenuItem = {
  id: string;
  category: MenuCategory;
  price: number;
  image: string;
  popular?: boolean;
  spicy?: boolean;
  vegetarian?: boolean;
};

export const menuCategories: Array<MenuCategory | "all"> = [
  "all",
  "pizza",
  "burgers",
  "salads",
];

export const menuItems: MenuItem[] = [
  {
    id: "margherita",
    category: "pizza",
    price: 11.9,
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop",
    popular: true,
    vegetarian: true,
  },
  {
    id: "pepperoni",
    category: "pizza",
    price: 13.5,
    image:
      "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&h=400&fit=crop",
    popular: true,
  },
  {
    id: "quattro-formaggi",
    category: "pizza",
    price: 14.9,
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop",
    vegetarian: true,
  },
  {
    id: "diavola",
    category: "pizza",
    price: 14.5,
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop",
    spicy: true,
  },
  {
    id: "bbq-chicken",
    category: "pizza",
    price: 15.9,
    image:
      "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600&h=400&fit=crop",
  },
  {
    id: "classic-burger",
    category: "burgers",
    price: 12.5,
    image:
      "https://images.unsplash.com/photo-1568901347635-c0230d026786?w=600&h=400&fit=crop",
    popular: true,
  },
  {
    id: "double-cheese",
    category: "burgers",
    price: 14.9,
    image:
      "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&h=400&fit=crop",
  },
  {
    id: "bacon-bbq",
    category: "burgers",
    price: 15.5,
    image:
      "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&h=400&fit=crop",
    popular: true,
  },
  {
    id: "spicy-chicken",
    category: "burgers",
    price: 13.9,
    image:
      "https://images.unsplash.com/photo-1606755962773-d324e166a853?w=600&h=400&fit=crop",
    spicy: true,
  },
  {
    id: "veggie-burger",
    category: "burgers",
    price: 12.9,
    image:
      "https://images.unsplash.com/photo-1520072959219-cedfcbbe3b5e?w=600&h=400&fit=crop",
    vegetarian: true,
  },
  {
    id: "caesar",
    category: "salads",
    price: 10.9,
    image:
      "https://images.unsplash.com/photo-1546793665-746782f70c92?w=600&h=400&fit=crop",
    popular: true,
  },
  {
    id: "greek",
    category: "salads",
    price: 11.5,
    image:
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop",
    vegetarian: true,
  },
  {
    id: "grilled-chicken",
    category: "salads",
    price: 13.9,
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop",
  },
  {
    id: "caprese",
    category: "salads",
    price: 10.5,
    image:
      "https://images.unsplash.com/photo-1608897010299-4734467096e7?w=600&h=400&fit=crop",
    vegetarian: true,
  },
];

export function getMenuItemById(id: string) {
  return menuItems.find((item) => item.id === id);
}
