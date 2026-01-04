import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController, AdminProductsController } from './products.controller';
import { Product } from '../database/entities/product.entity';
import { Comment } from '../database/entities/comment.entity';
import { ProductLike } from '../database/entities/product-like.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Comment, ProductLike]),
  ],
  controllers: [ProductsController, AdminProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
