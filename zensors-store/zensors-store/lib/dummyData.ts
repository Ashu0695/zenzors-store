import { Product, Category } from '../types'

export const DUMMY_CATEGORIES: Category[] = [
  { id: '1', name: 'Fine Jewelry', slug: 'fine-jewelry', image: '/images/jewelry.png', description: null, parent_id: null },
  { id: '2', name: 'School Bags',  slug: 'school-bags',  image: '/images/bag.png',     description: null, parent_id: null },
  { id: '3', name: 'Bottles',      slug: 'bottles',      image: '/images/bottle.png',  description: null, parent_id: null },
  { id: '4', name: 'Cameras',      slug: 'cameras',      image: '/images/camera.png',  description: null, parent_id: null },
  { id: '5', name: 'Lifestyle',    slug: 'lifestyle',    image: '/images/top.png',     description: null, parent_id: null },
]

export const DUMMY_PRODUCTS: Product[] = [
  // ── Fine Jewelry ─────────────────────────────────
  {
    id: '101', name: 'Aurelia Diamond Pendant', slug: 'aurelia-diamond-pendant',
    description: 'An elegant diamond pendant set in 18k white gold, perfect for special occasions. Each stone is hand-selected for maximum brilliance.',
    price: 45000, compare_price: 55000, images: ['/images/jewelry.png'],
    category_id: '1', category: DUMMY_CATEGORIES[0], stock: 10, is_active: true, is_featured: true,
    tags: ['luxury', 'diamond', 'necklace', 'jewelry'], sku: 'JWL-001', created_at: new Date().toISOString(),
    rating_avg: 4.9, rating_count: 284,
  },
  {
    id: '106', name: 'Gold Gemstone Ring', slug: 'gold-gemstone-ring',
    description: 'A stunning 22k gold ring adorned with a vibrant natural gemstone. A statement piece that complements every look.',
    price: 28000, compare_price: 35000, images: ['/images/jewelry2.png'],
    category_id: '1', category: DUMMY_CATEGORIES[0], stock: 8, is_active: true, is_featured: true,
    tags: ['gold', 'ring', 'gemstone', 'jewelry'], sku: 'JWL-002', created_at: new Date(Date.now() - 86400000).toISOString(),
    rating_avg: 4.7, rating_count: 130,
  },
  {
    id: '107', name: 'Pearl Bracelet Set', slug: 'pearl-bracelet-set',
    description: 'A delicate set of freshwater pearl bracelets, designed to be stacked or worn individually.',
    price: 5500, compare_price: null, images: ['/images/jewelry.png'],
    category_id: '1', category: DUMMY_CATEGORIES[0], stock: 20, is_active: true, is_featured: false,
    tags: ['pearl', 'bracelet', 'jewelry'], sku: 'JWL-003', created_at: new Date(Date.now() - 172800000).toISOString(),
    rating_avg: 4.5, rating_count: 67,
  },

  // ── School Bags ───────────────────────────────────
  {
    id: '102', name: 'Premium Leather School Bag', slug: 'premium-leather-school-bag',
    description: 'Durable, stylish, and spacious school bag made from genuine vegan leather. Multiple compartments for perfect organisation.',
    price: 3200, compare_price: 4000, images: ['/images/bag.png'],
    category_id: '2', category: DUMMY_CATEGORIES[1], stock: 25, is_active: true, is_featured: true,
    tags: ['bag', 'school', 'leather'], sku: 'BAG-001', created_at: new Date().toISOString(),
    rating_avg: 4.6, rating_count: 198,
  },
  {
    id: '108', name: 'Urban Explorer Backpack', slug: 'urban-explorer-backpack',
    description: 'A lightweight, durable backpack built for students who mean business. Anti-theft zipper and USB charging port included.',
    price: 1999, compare_price: 2500, images: ['/images/bag2.png'],
    category_id: '2', category: DUMMY_CATEGORIES[1], stock: 40, is_active: true, is_featured: true,
    tags: ['backpack', 'urban', 'student'], sku: 'BAG-002', created_at: new Date(Date.now() - 86400000).toISOString(),
    rating_avg: 4.4, rating_count: 89,
  },
  {
    id: '109', name: 'Mini Crossbody Tote', slug: 'mini-crossbody-tote',
    description: 'Compact and cute mini tote bag perfect for day trips and casual outings. Available in multiple colors.',
    price: 899, compare_price: null, images: ['/images/bag.png'],
    category_id: '2', category: DUMMY_CATEGORIES[1], stock: 60, is_active: true, is_featured: false,
    tags: ['tote', 'crossbody', 'mini'], sku: 'BAG-003', created_at: new Date(Date.now() - 259200000).toISOString(),
    rating_avg: 4.2, rating_count: 44,
  },

  // ── Bottles ───────────────────────────────────────
  {
    id: '103', name: 'Aura Smart Water Bottle', slug: 'aura-smart-bottle',
    description: 'Keep track of your hydration with this smart water bottle featuring LED indicators and temperature control.',
    price: 1500, compare_price: 2000, images: ['/images/bottle.png'],
    category_id: '3', category: DUMMY_CATEGORIES[2], stock: 50, is_active: true, is_featured: true,
    tags: ['bottle', 'smart', 'fitness'], sku: 'BTL-001', created_at: new Date().toISOString(),
    rating_avg: 4.7, rating_count: 321,
  },
  {
    id: '110', name: 'Glacier Insulated Flask', slug: 'glacier-insulated-flask',
    description: 'Double-wall vacuum insulated flask. Keeps drinks hot for 12 hours and cold for 24 hours. 100% leak proof.',
    price: 799, compare_price: null, images: ['/images/bottle.png'],
    category_id: '3', category: DUMMY_CATEGORIES[2], stock: 80, is_active: true, is_featured: false,
    tags: ['flask', 'insulated', 'travel'], sku: 'BTL-002', created_at: new Date(Date.now() - 86400000).toISOString(),
    rating_avg: 4.5, rating_count: 156,
  },

  // ── Cameras ───────────────────────────────────────
  {
    id: '104', name: 'Retro Digital Camera 4K', slug: 'retro-digital-camera',
    description: 'Capture memories in stunning 4K with this beautiful retro-styled digital camera. Built-in Wi-Fi and Bluetooth for instant sharing.',
    price: 35000, compare_price: 40000, images: ['/images/camera.png'],
    category_id: '4', category: DUMMY_CATEGORIES[3], stock: 5, is_active: true, is_featured: true,
    tags: ['camera', 'photography', '4k', 'retro'], sku: 'CAM-001', created_at: new Date().toISOString(),
    rating_avg: 4.8, rating_count: 76,
  },
  {
    id: '111', name: 'Instant Film Camera', slug: 'instant-film-camera',
    description: 'Fun, portable instant film camera with automatic flash and self-timer. Print memories in seconds.',
    price: 8999, compare_price: 10500, images: ['/images/camera2.png'],
    category_id: '4', category: DUMMY_CATEGORIES[3], stock: 15, is_active: true, is_featured: true,
    tags: ['instant', 'camera', 'film', 'fun'], sku: 'CAM-002', created_at: new Date(Date.now() - 86400000).toISOString(),
    rating_avg: 4.6, rating_count: 203,
  },

  // ── Lifestyle (Girls Tops) ────────────────────────
  {
    id: '105', name: 'Floral Chic Girls Top', slug: 'floral-chic-girls-top',
    description: 'A trendy and comfortable floral top for girls, perfect for casual outings. Made from breathable cotton fabric.',
    price: 899, compare_price: 1299, images: ['/images/top.png'],
    category_id: '5', category: DUMMY_CATEGORIES[4], stock: 30, is_active: true, is_featured: true,
    tags: ['fashion', 'top', 'girls', 'floral'], sku: 'TOP-001', created_at: new Date().toISOString(),
    rating_avg: 4.5, rating_count: 112,
  },
  {
    id: '112', name: 'Boho Printed Tunic', slug: 'boho-printed-tunic',
    description: 'Easy-breezy bohemian printed tunic. Pairs beautifully with jeans or leggings for a relaxed, stylish look.',
    price: 749, compare_price: null, images: ['/images/top2.png'],
    category_id: '5', category: DUMMY_CATEGORIES[4], stock: 45, is_active: true, is_featured: false,
    tags: ['fashion', 'tunic', 'boho', 'printed'], sku: 'TOP-002', created_at: new Date(Date.now() - 86400000).toISOString(),
    rating_avg: 4.3, rating_count: 58,
  },
  {
    id: '113', name: 'Solid Crop Top with Tie', slug: 'solid-crop-top-tie',
    description: 'A chic solid-colour crop top with a front tie knot detail. Perfect for summers and casual brunches.',
    price: 599, compare_price: 799, images: ['/images/top.png'],
    category_id: '5', category: DUMMY_CATEGORIES[4], stock: 55, is_active: true, is_featured: false,
    tags: ['crop', 'top', 'solid', 'summer'], sku: 'TOP-003', created_at: new Date(Date.now() - 172800000).toISOString(),
    rating_avg: 4.4, rating_count: 77,
  },
]
