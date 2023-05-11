import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';

import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { Product, ProductImage } from './entities';
import { PaginationDTO } from 'src/common/dtos/pagination.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      const { images = [], ...productDetails } = createProductDto;

      // typeorm infers product property on productImageRepository
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map((image) =>
          this.productImageRepository.create({ url: image }),
        ),
      }); // only create an instance of  the product

      // stores both product and images
      await this.productRepository.save(product);

      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDTO: PaginationDTO): Promise<Product[]> {
    const { limit = 10, offset = 0 } = paginationDTO;

    return this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true, // return data related to the entity
      },
    });
  }

  async findOne(term: string): Promise<Product> {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({
        id: term,
      });

      // Alternative to use 'eager: true' on product entity

      // product = await this.productRepository.findOne({
      //   where: { id: term },
      //   relations: { images: true },
      // });
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('product');

      product = await queryBuilder
        // LOWER() is a postgres function
        .where(`LOWER(title) =:title or slug=:slug`, {
          title: term,
          slug: term,
        })
        .leftJoinAndSelect('product.images', 'prodImages') // it's required when eager relations cannot be used
        .getOne();
    }

    if (!product) {
      throw new NotFoundException(`Product with term '${term}' not found`);
    }

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const { images, ...toUpdate } = updateProductDto;

    // typeorm handles searching the product before load it
    const product = await this.productRepository.preload({
      id,
      ...toUpdate,
    });

    if (!product) {
      throw new NotFoundException(`Product with id '${id} not found.'`);
    }

    // Create query runner
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, {
          product: { id },
        });

        product.images = images.map((image) =>
          this.productImageRepository.create({ url: image }),
        );
      }

      await queryRunner.manager.save(product);

      await queryRunner.commitTransaction(); // effectively saves the changes if both transactions were successful
      await queryRunner.release();

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction(); // rollback any changes
      await queryRunner.release();

      this.handleDBExceptions(error);
    }
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);

    await this.productRepository.remove(product);
  }

  private handleDBExceptions(error: any): never {
    if (error.code == '23505') {
      throw new BadRequestException(error.detail);
    }

    this.logger.error(error);

    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  // only for development environments
  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}
