import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ProductsService } from 'src/products/products.service';
import { Product } from 'src/products/entities';
import { initialData } from './data/seed-data';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class SeedService {
  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async runSeed() {
    await this.purgeDB();

    const adminUser = await this.insertSeedUsers();

    await this.insertSeedProducts(adminUser);

    return 'SEED EXECUTED';
  }

  private async purgeDB() {
    const queryBuilder = this.userRepository.createQueryBuilder();

    await this.productsService.deleteAllProducts();
    await queryBuilder.delete().where({}).execute();
  }

  private async insertSeedUsers() {
    const seedUsers = initialData.users;

    const users: User[] = [];

    seedUsers.forEach((user) => {
      users.push(this.userRepository.create(user));
    });

    const dbUsers = await this.userRepository.save(users);

    return dbUsers[0]; // in order to get user data and add it to producs
  }

  private async insertSeedProducts(adminUser: User) {
    await this.productsService.deleteAllProducts();

    const products = initialData.products;
    const insertPromises: Promise<Product>[] = [];

    products.forEach((product) => {
      insertPromises.push(this.productsService.create(product, adminUser));
    });

    await Promise.all(insertPromises);

    return true;
  }
}
