export type Review = {
  id: string;
  rating: number;
};

export const reviews: Review[] = [
  { id: "sarah", rating: 5 },
  { id: "marco", rating: 5 },
  { id: "elena", rating: 4 },
  { id: "thomas", rating: 5 },
  { id: "julia", rating: 5 },
];

export const averageRating =
  reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
