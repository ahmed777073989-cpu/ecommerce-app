export interface Category {
  id: string;
  nameEn: string;
  nameAr: string;
  parentId?: string;
  createdAt: Date;
}

export interface CreateCategoryDto {
  nameEn: string;
  nameAr: string;
  parentId?: string;
}

export interface UpdateCategoryDto {
  nameEn?: string;
  nameAr?: string;
  parentId?: string;
}

export interface CategoryWithCount extends Category {
  productCount: number;
}
