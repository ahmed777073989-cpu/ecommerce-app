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
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommentDto {
  text: string;
  rating: number;
}

export interface UpdateCommentDto {
  flagged: boolean;
}

export interface CommentsResponse {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductLike {
  id: string;
  productId: string;
  userId: string;
  createdAt: Date;
}
