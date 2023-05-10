import { Injectable } from '@nestjs/common';

import { ProductsService } from 'src/products/products.service';

@Injectable()
export class SeedService {
  constructor(private readonly productsService: ProductsService) {}

  async runSeed() {
    return 'Seed executed';
  }

  private async insertSeedProducts() {
    await this.productsService.deleteAllProducts();

    return true;
  }
}
