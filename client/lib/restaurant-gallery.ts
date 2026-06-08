export type RestaurantPhoto = {
  id: string;
  image: string;
  wide?: boolean;
};

export const restaurantPhotos: RestaurantPhoto[] = [
  {
    id: "interior",
    image:
      "https://images.unsplash.com/photo-1517248135460-4c3ded0774f0?w=800&h=600&fit=crop",
    wide: true,
  },
  {
    id: "dining",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4336fda?w=600&h=600&fit=crop",
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
      "https://images.unsplash.com/photo-1559339352-11d035aa6528?w=800&h=600&fit=crop",
    wide: true,
  },
  {
    id: "team",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=600&fit=crop",
  },
];
