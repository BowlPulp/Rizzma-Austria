export type RestaurantPhoto = {
  id: string;
  image: string;
  wide?: boolean;
};

export const restaurantPhotos: RestaurantPhoto[] = [
  {
    id: "interior",
    image:
      "https://plus.unsplash.com/premium_photo-1661883237884-263e8de8869b?q=80&w=2089&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    wide: true,
  },
  {
    id: "dining",
    image:
      "https://images.unsplash.com/photo-1592861956120-e524fc739696?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "kitchen",
    image:
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&h=600&fit=crop",
  },
  {
    id: "pizza-oven",
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=600&fit=crop",
  },
  {
    id: "counter",
    image:
      "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    wide: true,
  },
  {
    id: "team",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=600&fit=crop",
  },
];
