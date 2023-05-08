import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Product } from './';

@Entity()
export class ProductImage {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({
    type: 'text',
  })
  url: string;

  @ManyToOne(() => Product, (product) => product.images)
  product: Product;
}
