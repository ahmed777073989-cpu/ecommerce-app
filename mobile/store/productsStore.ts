import { create } from 'zustand';
import { Product, Category, ProductsResponse } from '../api/products';

interface ProductsState {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string | null;
  selectedTag: string | null;
  sortBy: string;
  total: number;
  page: number;

  setProducts: (products: Product[]) => void;
  setCategories: (categories: Category[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (categoryId: string | null) => void;
  setSelectedTag: (tag: string | null) => void;
  setSortBy: (sortBy: string) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
}

export const useProductsStore = create<ProductsState>((set) => ({
  products: [],
  categories: [],
  loading: false,
  error: null,
  searchQuery: '',
  selectedCategory: null,
  selectedTag: null,
  sortBy: 'newest',
  total: 0,
  page: 1,

  setProducts: (products) => set({ products }),
  setCategories: (categories) => set({ categories }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSearchQuery: (searchQuery) => set({ searchQuery, page: 1 }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory, page: 1 }),
  setSelectedTag: (selectedTag) => set({ selectedTag, page: 1 }),
  setSortBy: (sortBy) => set({ sortBy }),
  setPage: (page) => set({ page }),
  resetFilters: () => set({
    searchQuery: '',
    selectedCategory: null,
    selectedTag: null,
    sortBy: 'newest',
    page: 1,
  }),
}));
