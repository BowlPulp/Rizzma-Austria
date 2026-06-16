import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { MenuItem, Category } from '../models';

/**
 * Category seed data. Categories are dynamic — admins can add more from the
 * dashboard — but these three ship by default.
 */
const categories = [
  { slug: "pizza", name: "\ud83c\udf55 Pizza", order: 0 },
  { slug: "burgers", name: "\ud83c\udf54 Burgers", order: 1 },
  { slug: "salads", name: "\ud83e\udd57 Salads", order: 2 },
];

/**
 * Menu item seed data matching the original 14 items. Prices are in EUR.
 * Names and descriptions are English; admins can edit them from the dashboard.
 */
const menuItems = [
  {
    slug: "margherita",
    name: "Margherita Pizza",
    description: "San Marzano tomato sauce, fresh mozzarella, basil, and extra virgin olive oil on a thin crust.",
    category: "pizza",
    price: 11.90,
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop",
    popular: true,
    spicy: false,
    vegetarian: true,
    available: true,
  },
  {
    slug: "pepperoni",
    name: "Pepperoni Pizza",
    description: "Classic tomato base topped with mozzarella and crispy pepperoni slices.",
    category: "pizza",
    price: 13.50,
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&h=400&fit=crop",
    popular: true,
    spicy: false,
    vegetarian: false,
    available: true,
  },
  {
    slug: "quattro-formaggi",
    name: "Quattro Formaggi",
    description: "Four-cheese blend of mozzarella, gorgonzola, parmesan, and fontina on a golden crust.",
    category: "pizza",
    price: 14.90,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop",
    popular: false,
    spicy: false,
    vegetarian: true,
    available: true,
  },
  {
    slug: "diavola",
    name: "Diavola Pizza",
    description: "Spicy salami, chili flakes, tomato sauce, and melted mozzarella for heat lovers.",
    category: "pizza",
    price: 14.50,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop",
    popular: false,
    spicy: true,
    vegetarian: false,
    available: true,
  },
  {
    slug: "bbq-chicken",
    name: "BBQ Chicken Pizza",
    description: "Smoky BBQ sauce, grilled chicken, red onion, mozzarella, and fresh cilantro.",
    category: "pizza",
    price: 15.90,
    image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600&h=400&fit=crop",
    popular: false,
    spicy: false,
    vegetarian: false,
    available: true,
  },
  {
    slug: "classic-burger",
    name: "Classic Rizzma Burger",
    description: "Angus beef patty, cheddar, lettuce, tomato, pickles, and our signature Rizzma sauce.",
    category: "burgers",
    price: 12.50,
    image: "https://images.unsplash.com/photo-1568901347635-c0230d026786?w=600&h=400&fit=crop",
    popular: true,
    spicy: false,
    vegetarian: false,
    available: true,
  },
  {
    slug: "double-cheese",
    name: "Double Cheese Burger",
    description: "Two beef patties stacked with double cheddar, caramelized onions, and house mayo.",
    category: "burgers",
    price: 14.90,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&h=400&fit=crop",
    popular: false,
    spicy: false,
    vegetarian: false,
    available: true,
  },
  {
    slug: "bacon-bbq",
    name: "Bacon BBQ Burger",
    description: "Crispy bacon, cheddar, onion rings, and smoky BBQ sauce on a brioche bun.",
    category: "burgers",
    price: 15.50,
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&h=400&fit=crop",
    popular: true,
    spicy: false,
    vegetarian: false,
    available: true,
  },
  {
    slug: "spicy-chicken",
    name: "Spicy Chicken Burger",
    description: "Crispy chicken fillet, pepper jack, jalape\u00f1os, and chipotle mayo with a kick.",
    category: "burgers",
    price: 13.90,
    image: "https://images.unsplash.com/photo-1606755962773-d324e166a853?w=600&h=400&fit=crop",
    popular: false,
    spicy: true,
    vegetarian: false,
    available: true,
  },
  {
    slug: "veggie-burger",
    name: "Veggie Burger",
    description: "Grilled plant-based patty, avocado, arugula, tomato, and herb aioli.",
    category: "burgers",
    price: 12.90,
    image: "https://images.unsplash.com/photo-1520072959219-cedfcbbe3b5e?w=600&h=400&fit=crop",
    popular: false,
    spicy: false,
    vegetarian: true,
    available: true,
  },
  {
    slug: "caesar",
    name: "Caesar Salad",
    description: "Crisp romaine, parmesan shavings, garlic croutons, and creamy Caesar dressing.",
    category: "salads",
    price: 10.90,
    image: "https://images.unsplash.com/photo-1546793665-746782f70c92?w=600&h=400&fit=crop",
    popular: true,
    spicy: false,
    vegetarian: false,
    available: true,
  },
  {
    slug: "greek",
    name: "Greek Salad",
    description: "Cucumber, tomato, red onion, olives, feta, and oregano vinaigrette.",
    category: "salads",
    price: 11.50,
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop",
    popular: false,
    spicy: false,
    vegetarian: true,
    available: true,
  },
  {
    slug: "grilled-chicken",
    name: "Grilled Chicken Salad",
    description: "Mixed greens, grilled chicken breast, cherry tomatoes, and honey mustard dressing.",
    category: "salads",
    price: 13.90,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop",
    popular: false,
    spicy: false,
    vegetarian: false,
    available: true,
  },
  {
    slug: "caprese",
    name: "Caprese Salad",
    description: "Fresh mozzarella, ripe tomatoes, basil, balsamic glaze, and extra virgin olive oil.",
    category: "salads",
    price: 10.50,
    image: "https://images.unsplash.com/photo-1608897010299-4734467096e7?w=600&h=400&fit=crop",
    popular: false,
    spicy: false,
    vegetarian: true,
    available: true,
  },
];

async function seed(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI is not defined in environment variables');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    console.log('🌱 Seeding categories...');
    for (const cat of categories) {
      await Category.findOneAndUpdate(
        { slug: cat.slug },
        { $set: cat },
        { upsert: true, new: true, runValidators: true }
      );
      console.log(`  ✨ Category: ${cat.slug}`);
    }

    console.log('🌱 Seeding menu items...');
    let created = 0;
    let updated = 0;

    for (const item of menuItems) {
      const result = await MenuItem.findOneAndUpdate(
        { slug: item.slug },
        { $set: item },
        { upsert: true, new: true, runValidators: true }
      );

      const isNew =
        Math.abs(result.createdAt.getTime() - result.updatedAt.getTime()) < 1000;

      if (isNew) {
        created++;
        console.log(`  ✨ Created: ${item.slug} (${item.category}) - €${item.price}`);
      } else {
        updated++;
        console.log(`  🔄 Updated: ${item.slug} (${item.category}) - €${item.price}`);
      }
    }

    console.log(`\n🎉 Seed complete! Created: ${created}, Updated: ${updated}`);
    console.log(`📊 Total menu items in database: ${await MenuItem.countDocuments()}`);
    console.log(`📊 Total categories in database: ${await Category.countDocuments()}`);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seed();
