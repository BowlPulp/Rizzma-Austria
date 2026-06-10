import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { MenuItem } from '../models';

/**
 * Menu item seed data matching the frontend's 14 items exactly.
 * Prices are in EUR.
 */
const menuItems = [
  // ===== PIZZAS =====
  {
    slug: 'margherita',
    category: 'pizza' as const,
    price: 11.90,
    image: '/images/menu/margherita.jpg',
    popular: true,
    spicy: false,
    vegetarian: true,
    available: true,
  },
  {
    slug: 'pepperoni',
    category: 'pizza' as const,
    price: 13.50,
    image: '/images/menu/pepperoni.jpg',
    popular: true,
    spicy: false,
    vegetarian: false,
    available: true,
  },
  {
    slug: 'quattro-formaggi',
    category: 'pizza' as const,
    price: 14.90,
    image: '/images/menu/quattro-formaggi.jpg',
    popular: false,
    spicy: false,
    vegetarian: true,
    available: true,
  },
  {
    slug: 'diavola',
    category: 'pizza' as const,
    price: 14.50,
    image: '/images/menu/diavola.jpg',
    popular: false,
    spicy: true,
    vegetarian: false,
    available: true,
  },
  {
    slug: 'bbq-chicken',
    category: 'pizza' as const,
    price: 15.90,
    image: '/images/menu/bbq-chicken.jpg',
    popular: false,
    spicy: false,
    vegetarian: false,
    available: true,
  },

  // ===== BURGERS =====
  {
    slug: 'classic-burger',
    category: 'burgers' as const,
    price: 12.50,
    image: '/images/menu/classic-burger.jpg',
    popular: true,
    spicy: false,
    vegetarian: false,
    available: true,
  },
  {
    slug: 'double-cheese',
    category: 'burgers' as const,
    price: 14.90,
    image: '/images/menu/double-cheese.jpg',
    popular: false,
    spicy: false,
    vegetarian: false,
    available: true,
  },
  {
    slug: 'bacon-bbq',
    category: 'burgers' as const,
    price: 15.50,
    image: '/images/menu/bacon-bbq.jpg',
    popular: true,
    spicy: false,
    vegetarian: false,
    available: true,
  },
  {
    slug: 'spicy-chicken',
    category: 'burgers' as const,
    price: 13.90,
    image: '/images/menu/spicy-chicken.jpg',
    popular: false,
    spicy: true,
    vegetarian: false,
    available: true,
  },
  {
    slug: 'veggie-burger',
    category: 'burgers' as const,
    price: 12.90,
    image: '/images/menu/veggie-burger.jpg',
    popular: false,
    spicy: false,
    vegetarian: true,
    available: true,
  },

  // ===== SALADS =====
  {
    slug: 'caesar',
    category: 'salads' as const,
    price: 10.90,
    image: '/images/menu/caesar.jpg',
    popular: true,
    spicy: false,
    vegetarian: false,
    available: true,
  },
  {
    slug: 'greek',
    category: 'salads' as const,
    price: 11.50,
    image: '/images/menu/greek.jpg',
    popular: false,
    spicy: false,
    vegetarian: true,
    available: true,
  },
  {
    slug: 'grilled-chicken',
    category: 'salads' as const,
    price: 13.90,
    image: '/images/menu/grilled-chicken.jpg',
    popular: false,
    spicy: false,
    vegetarian: false,
    available: true,
  },
  {
    slug: 'caprese',
    category: 'salads' as const,
    price: 10.50,
    image: '/images/menu/caprese.jpg',
    popular: false,
    spicy: false,
    vegetarian: true,
    available: true,
  },
];

/**
 * Seeds the MenuItem collection with 14 menu items.
 * Uses upsert (findOneAndUpdate) so it can be run multiple times safely.
 */
async function seed(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('❌ MONGODB_URI is not defined. Create a .env file from .env.example');
    process.exit(1);
  }

  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    console.log('🌱 Seeding menu items...');

    let created = 0;
    let updated = 0;

    for (const item of menuItems) {
      const result = await MenuItem.findOneAndUpdate(
        { slug: item.slug },
        { $set: item },
        { upsert: true, new: true, runValidators: true }
      );

      // Check if this was a new document or an update
      // If createdAt and updatedAt are very close, it's likely a new document
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
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seed();
