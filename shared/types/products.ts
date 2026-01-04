export enum ProductTag {
  NEW = 'new',
  COMING_SOON = 'coming_soon',
  ORDER_TO_BUY = 'order_to_buy',
}

export enum ProductSortBy {
  NEWEST = 'newest',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  TRENDING = 'trending',
  VIEWS = 'views',
  LIKES = 'likes',
}

export interface Product {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  cost?: number;
  currency: string;
  categoryId: string;
  tags: ProductTag[];
  images: string[];
  stockCount: number;
  available: boolean;
  expiryTimer?: Date;
  viewsCount: number;
  likes: number;
  dislikes: number;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductWithRelations extends Product {
  category?: Category;
  comments?: Comment[];
}

export interface CreateProductDto {
  title: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  cost?: number;
  currency: string;
  categoryId: string;
  tags: ProductTag[];
  images: string[];
  stockCount: number;
  available: boolean;
  expiryTimer?: string;
}

export interface UpdateProductDto {
  title?: string;
  shortDescription?: string;
  fullDescription?: string;
  price?: number;
  cost?: number;
  currency?: string;
  categoryId?: string;
  tags?: ProductTag[];
  images?: string[];
  stockCount?: number;
  available?: boolean;
  expiryTimer?: string;
}

export interface ProductFilterDto {
  category?: string;
  tag?: ProductTag;
  available?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface ToggleAvailabilityDto {
  available: boolean;
}

export interface UpdateStockDto {
  stockCount: number;
}
