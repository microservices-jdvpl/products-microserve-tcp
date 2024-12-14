import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductsService');
  onModuleInit() {
    this.$connect();
    this.logger.log('Connected to the database');
  }
  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto,
    });
  }

  async findAll(headers: PaginationDto) {
    const { page, limit } = headers;
    const count = await this.product.count({ where: { available: true } });
    const lastPage = Math.ceil(count / limit);
    return {
      count,
      lastPage,
      page,
      results: await this.product.findMany({
        where: { available: true },
        skip: (page - 1) * limit,
        take: limit,
      }),
    };
  }

  async findOne(id: number) {
    const product = await this.product.findUnique({
      where: { id, available: true },
    });
    if (!product) {
      throw new RpcException({
        message: `Product ${id} not found`,
        status: HttpStatus.BAD_REQUEST,
      });
    }
    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    const { id: __, ...data } = updateProductDto;
    this.findOne(id);
    return this.product.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.product.update({ where: { id }, data: { available: false } });
  }

  async validateProductsIds(ids: number[]) {
    ids = Array.from(new Set(ids));
    const products = await this.product.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
    if (products.length !== ids.length) {
      throw new RpcException({
        message: 'Some products were not found',
        status: HttpStatus.BAD_REQUEST,
      });
    }
    return products;
  }
}
