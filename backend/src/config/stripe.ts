import dotenv from "dotenv";
dotenv.config();

import Stripe from "stripe";

console.log("STRIPE_SECRET_KEY =", process.env.STRIPE_SECRET_KEY);

const key = process.env.STRIPE_SECRET_KEY;

if (!key) {
  throw new Error("STRIPE_SECRET_KEY is undefined");
}

const stripe = new Stripe(key, {
  apiVersion: "2025-04-30.basil",
});

export default stripe;