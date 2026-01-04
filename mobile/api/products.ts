import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export interface Product {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  cost?: number;
  currency: string;
  categoryId: string;
  tags: string[];
  images: string[];
  stockCount: number;
  available: boolean;
  expiryTimer?: string;
  viewsCount: number;
  likes: number;
  dislikes: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    nameEn: string;
    nameAr: string;
  };
  comments?: Comment[];
}

export interface Comment {
  id: string;
  productId: string;
  userId: string;
  user?: {
    id: string;
    name: string;
  };
  text: string;
  rating: number;
  flagged: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  nameEn: string;
  nameAr: string;
  productCount: number;
  createdAt: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface CommentsResponse {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
}

class ProductsApi {
  private getHeaders() {
    const token = globalThis.__token__ || '';
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getProducts(params?: {
    category?: string;
    tag?: string;
    available?: boolean;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    page?: number;
    limit?: number;
  }): Promise<ProductsResponse> {
    const response = await axios.get(`${API_BASE_URL}/api/products`, {
      headers: this.getHeaders(),
      params,
    });
    return response.data;
  }

  async getProduct(id: string): Promise<Product> {
    const response = await axios.get(`${API_BASE_URL}/api/products/${id}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async incrementViews(id: string): Promise<void> {
    await axios.post(`${API_BASE_URL}/api/products/${id}/views`, {}, {
      headers: this.getHeaders(),
    });
  }

  async toggleLike(id: string): Promise<{ liked: boolean; likesCount: number }> {
    const response = await axios.post(`${API_BASE_URL}/api/products/${id}/like`, {}, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async addComment(id: string, text: string, rating: number): Promise<Comment> {
    const response = await axios.post(`${API_BASE_URL}/api/products/${id}/comments`, {
      text,
      rating,
    }, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async getComments(id: string, page = 1, limit = 20): Promise<CommentsResponse> {
    const response = await axios.get(`${API_BASE_URL}/api/products/${id}/comments`, {
      headers: this.getHeaders(),
      params: { page, limit },
    });
    return response.data;
  }

  async getCategories(): Promise<Category[]> {
    const response = await axios.get(`${API_BASE_URL}/api/categories`, {
      headers: this.getHeaders(),
    });
    return response.data.categories || response.data;
  }
}

export const productsApi = new ProductsApi();
