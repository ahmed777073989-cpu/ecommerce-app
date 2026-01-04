import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../database/entities/product.entity';
import { Comment } from '../database/entities/comment.entity';
import { ProductLike } from '../database/entities/product-like.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { ToggleAvailabilityDto } from './dto/toggle-availability.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(ProductLike)
    private productLikeRepository: Repository<ProductLike>,
  ) {}

  // Admin operations
  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  async findAllForAdmin(): Promise<Product[]> {
    return this.productRepository.find({
      withDeleted: true,
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneForAdmin(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: ['category', 'comments'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOneForAdmin(id);
    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOneForAdmin(id);
    await this.productRepository.softRemove(product);
  }

  async restore(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.productRepository.restore(id).then(() => product);
  }

  async toggleAvailability(id: string, dto: ToggleAvailabilityDto): Promise<Product> {
    const product = await this.findOneForAdmin(id);
    product.available = dto.available;
    return this.productRepository.save(product);
  }

  async updateStock(id: string, dto: UpdateStockDto): Promise<Product> {
    const product = await this.findOneForAdmin(id);
    product.stockCount = dto.stockCount;
    return this.productRepository.save(product);
  }

  // Public operations
  async findAll(filterDto: ProductFilterDto) {
    const {
      category,
      tag,
      available,
      search,
      minPrice,
      maxPrice,
      sortBy = 'newest',
      page = 1,
      limit = 20,
    } = filterDto;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    // Apply filters
    if (category) {
      queryBuilder.andWhere('product.categoryId = :category', { category });
    }

    if (tag) {
      queryBuilder.andWhere(':tag = ANY(product.tags)', { tag });
    }

    if (available !== undefined) {
      queryBuilder.andWhere('product.available = :available', { available });
    }

    if (search) {
      queryBuilder.andWhere(
        '(product.title ILIKE :search OR product.shortDescription ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        queryBuilder.orderBy('product.createdAt', 'DESC');
        break;
      case 'price_asc':
        queryBuilder.orderBy('product.price', 'ASC');
        break;
      case 'price_desc':
        queryBuilder.orderBy('product.price', 'DESC');
        break;
      case 'trending':
        queryBuilder.orderBy('product.viewsCount', 'DESC');
        break;
      case 'views':
        queryBuilder.orderBy('product.viewsCount', 'DESC');
        break;
      case 'likes':
        queryBuilder.orderBy('product.likes', 'DESC');
        break;
      default:
        queryBuilder.orderBy('product.createdAt', 'DESC');
    }

    // Pagination
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [products, total] = await queryBuilder.getManyAndCount();

    return {
      products,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'comments', 'comments.user'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findByCategory(categoryId: string, filterDto: ProductFilterDto) {
    return this.findAll({ ...filterDto, category: categoryId });
  }

  async incrementViews(id: string): Promise<void> {
    await this.productRepository.increment({ id }, 'viewsCount', 1);
  }

  // Like operations
  async toggleLike(userId: string, productId: string): Promise<{ liked: boolean; likesCount: number }> {
    const existingLike = await this.productLikeRepository.findOne({
      where: { userId, productId },
    });

    if (existingLike) {
      await this.productLikeRepository.remove(existingLike);
      await this.productRepository.decrement({ id: productId }, 'likes', 1);
      const product = await this.findOne(productId);
      return { liked: false, likesCount: product.likes };
    } else {
      const like = this.productLikeRepository.create({ userId, productId });
      await this.productLikeRepository.save(like);
      await this.productRepository.increment({ id: productId }, 'likes', 1);
      const product = await this.findOne(productId);
      return { liked: true, likesCount: product.likes };
    }
  }

  // Comment operations
  async addComment(userId: string, productId: string, createCommentDto: CreateCommentDto): Promise<Comment> {
    const product = await this.findOne(productId);
    const comment = this.commentRepository.create({
      ...createCommentDto,
      userId,
      productId,
    });
    return this.commentRepository.save(comment);
  }

  async getComments(productId: string, page = 1, limit = 20) {
    const [comments, total] = await this.commentRepository.findAndCount({
      where: { productId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      comments,
      total,
      page,
      limit,
    };
  }

  async flagComment(commentId: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    comment.flagged = !comment.flagged;
    return this.commentRepository.save(comment);
  }
}
