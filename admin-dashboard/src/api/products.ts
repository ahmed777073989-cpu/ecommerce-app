import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    nameEn: string;
    nameAr: string;
  };
}

export interface CreateProductDto {
  title: string;
  shortDescription?: string;
  fullDescription?: string;
  price: number;
  cost?: number;
  currency?: string;
  categoryId: string;
  tags?: string[];
  images?: string[];
  stockCount: number;
  available: boolean;
  expiryTimer?: string;
}

export interface Category {
  id: string;
  nameEn: string;
  nameAr: string;
  parentId?: string;
  createdAt: string;
}

class ProductsApi {
  private getHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getAllProducts(): Promise<Product[]> {
    const response = await axios.get(`${API_BASE_URL}/api/admin/products`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async getProduct(id: string): Promise<Product> {
    const response = await axios.get(`${API_BASE_URL}/api/admin/products/${id}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async createProduct(product: CreateProductDto): Promise<Product> {
    const response = await axios.post(`${API_BASE_URL}/api/admin/products`, product, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async updateProduct(id: string, product: Partial<CreateProductDto>): Promise<Product> {
    const response = await axios.patch(`${API_BASE_URL}/api/admin/products/${id}`, product, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async deleteProduct(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/api/admin/products/${id}`, {
      headers: this.getHeaders(),
    });
  }

  async toggleAvailability(id: string, available: boolean): Promise<Product> {
    const response = await axios.patch(`${API_BASE_URL}/api/admin/products/${id}/availability`, { available }, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async updateStock(id: string, stockCount: number): Promise<Product> {
    const response = await axios.patch(`${API_BASE_URL}/api/admin/products/${id}/stock`, { stockCount }, {
      headers: this.getHeaders(),
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
