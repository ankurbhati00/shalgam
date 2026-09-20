import type { Tint } from '@shalgam/types'

export interface CategorySeed {
  slug: string
  name: string
  description: string
  tint: Tint
  imageKey: string
  subcategories: Array<{ slug: string; name: string }>
}

export const categorySeeds: CategorySeed[] = [
  {
    slug: 'fruits-vegetables',
    name: 'Fruits & Vegetables',
    description: 'Farm-fresh produce sourced every morning from local mandis.',
    tint: 'lime',
    imageKey: 'cat-fruits-veg',
    subcategories: [
      { slug: 'fresh-vegetables', name: 'Fresh Vegetables' },
      { slug: 'fresh-fruits', name: 'Fresh Fruits' },
      { slug: 'herbs-leafy-greens', name: 'Herbs & Leafy Greens' },
      { slug: 'exotic-produce', name: 'Exotic Produce' },
    ],
  },
  {
    slug: 'dairy-bread',
    name: 'Dairy & Bread',
    description: 'Milk, curd, paneer and bakery-fresh breads delivered chilled.',
    tint: 'butter',
    imageKey: 'cat-dairy',
    subcategories: [
      { slug: 'milk', name: 'Milk' },
      { slug: 'curd-paneer', name: 'Curd & Paneer' },
      { slug: 'butter-cheese', name: 'Butter & Cheese' },
      { slug: 'bread-bakery', name: 'Bread & Bakery' },
    ],
  },
  {
    slug: 'eggs-meat-fish',
    name: 'Eggs, Meat & Fish',
    description: 'Hygienically packed, antibiotic-free and always fresh.',
    tint: 'peach',
    imageKey: 'cat-eggs-meat',
    subcategories: [
      { slug: 'eggs', name: 'Eggs' },
      { slug: 'chicken', name: 'Chicken' },
      { slug: 'fish-seafood', name: 'Fish & Seafood' },
    ],
  },
  {
    slug: 'atta-rice-dal',
    name: 'Atta, Rice & Dal',
    description: 'Kitchen staples: chakki atta, aged basmati and cleaned dals.',
    tint: 'butter',
    imageKey: 'cat-staples',
    subcategories: [
      { slug: 'atta-flours', name: 'Atta & Flours' },
      { slug: 'rice', name: 'Rice' },
      { slug: 'dal-pulses', name: 'Dal & Pulses' },
    ],
  },
  {
    slug: 'masala-oil',
    name: 'Masala & Oil',
    description: 'Whole and ground spices, cold-pressed oils and desi ghee.',
    tint: 'rose',
    imageKey: 'cat-spices',
    subcategories: [
      { slug: 'spices', name: 'Spices & Masalas' },
      { slug: 'oil-ghee', name: 'Oil & Ghee' },
      { slug: 'salt-sugar', name: 'Salt, Sugar & Jaggery' },
    ],
  },
  {
    slug: 'snacks-namkeen',
    name: 'Snacks & Namkeen',
    description: 'Chips, bhujia, biscuits and the good stuff for chai time.',
    tint: 'lavender',
    imageKey: 'cat-snacks',
    subcategories: [
      { slug: 'chips', name: 'Chips' },
      { slug: 'namkeen', name: 'Namkeen' },
      { slug: 'biscuits', name: 'Biscuits' },
      { slug: 'dry-fruits-nuts', name: 'Dry Fruits & Nuts' },
    ],
  },
  {
    slug: 'beverages',
    name: 'Beverages',
    description: 'Tea, coffee, juices and cold drinks.',
    tint: 'sky',
    imageKey: 'cat-beverages',
    subcategories: [
      { slug: 'tea-coffee', name: 'Tea & Coffee' },
      { slug: 'juices', name: 'Juices' },
      { slug: 'soft-drinks', name: 'Soft Drinks' },
    ],
  },
  {
    slug: 'breakfast-instant',
    name: 'Breakfast & Instant',
    description: 'Cereals, oats, noodles and ready-to-cook batters.',
    tint: 'mint',
    imageKey: 'cat-breakfast',
    subcategories: [
      { slug: 'cereals', name: 'Cereals & Oats' },
      { slug: 'noodles-pasta', name: 'Noodles & Pasta' },
      { slug: 'ready-to-cook', name: 'Ready to Cook' },
    ],
  },
  {
    slug: 'sweets-chocolates',
    name: 'Sweets & Chocolates',
    description: 'Mithai, chocolates and honey for every celebration.',
    tint: 'rose',
    imageKey: 'cat-sweets',
    subcategories: [
      { slug: 'chocolates', name: 'Chocolates' },
      { slug: 'indian-sweets', name: 'Indian Sweets' },
      { slug: 'honey-spreads', name: 'Honey & Spreads' },
    ],
  },
  {
    slug: 'personal-care',
    name: 'Personal Care',
    description: 'Bath, hair and oral care essentials.',
    tint: 'lavender',
    imageKey: 'cat-personal-care',
    subcategories: [
      { slug: 'bath-body', name: 'Bath & Body' },
      { slug: 'hair-care', name: 'Hair Care' },
      { slug: 'oral-care', name: 'Oral Care' },
    ],
  },
  {
    slug: 'household',
    name: 'Household',
    description: 'Cleaning, laundry and kitchen supplies.',
    tint: 'sky',
    imageKey: 'cat-household',
    subcategories: [
      { slug: 'cleaning', name: 'Cleaning' },
      { slug: 'laundry', name: 'Laundry' },
      { slug: 'kitchen-supplies', name: 'Kitchen Supplies' },
    ],
  },
  {
    slug: 'frozen',
    name: 'Frozen & Ice Cream',
    description: 'Frozen veggies, snacks and ice cream kept at −18 °C till your door.',
    tint: 'mint',
    imageKey: 'cat-frozen',
    subcategories: [
      { slug: 'frozen-veg', name: 'Frozen Vegetables' },
      { slug: 'ice-cream', name: 'Ice Cream' },
      { slug: 'frozen-snacks', name: 'Frozen Snacks' },
    ],
  },
]
