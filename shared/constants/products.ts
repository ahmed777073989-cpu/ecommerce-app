export const PRODUCT_TAGS = ['new', 'coming_soon', 'order_to_buy'] as const;

export const PRODUCT_SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'trending', label: 'Trending' },
  { value: 'views', label: 'Most Viewed' },
  { value: 'likes', label: 'Most Liked' },
] as const;

export const PRODUCT_PER_PAGE = 20;

export const DEFAULT_CURRENCY = 'SAR';

export const LOW_STOCK_THRESHOLD = 10;
