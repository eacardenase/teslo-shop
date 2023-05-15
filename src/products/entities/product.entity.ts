import { ApiProperty } from '@nestjs/swagger';

import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ProductImage } from './';
import { User } from 'src/auth/entities/user.entity';

@Entity({ name: 'products' })
export class Product {
  @ApiProperty({
    example: 'bca82608-5554-4923-9c0a-636970babb29',
    description: 'Product ID',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Teslo T-Shirt',
    description: 'Product Title',
    uniqueItems: true,
  })
  @Column({
    type: 'text',
    unique: true,
  })
  title: string;

  @ApiProperty({
    example: 0,
    description: 'Product Price',
  })
  @Column({
    type: 'float',
    default: 0,
  })
  price: number;

  @ApiProperty({
    example: 'Occaecat pariatur nulla consectetur laboris ea minim veniam.',
    description: 'Product Description',
    default: null,
  })
  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @ApiProperty({
    example: 'teslo_t_shirt',
    description: 'Product Slug',
    uniqueItems: true,
  })
  @Column({
    type: 'text',
    unique: true,
  })
  slug: string;

  @ApiProperty({
    example: 10,
    description: 'Product Stock',
    default: 0,
  })
  @Column({
    type: 'int',
    default: 0,
  })
  stock: number;

  @ApiProperty({
    example: ['SM', 'MD', 'LG'],
    description: 'Product Sizes',
  })
  @Column({
    type: 'text',
    array: true,
  })
  sizes: string[];

  @ApiProperty({
    example: 'men',
    description: 'Product Gender',
  })
  @Column({
    type: 'text',
  })
  gender: string;

  @ApiProperty({
    example: ['sport', 'men'],
    description: 'Product Stock',
    default: 0,
  })
  @Column({
    type: 'text',
    array: true,
    default: [],
  })
  tags: string[];

  @ApiProperty()
  @CreateDateColumn()
  createdDate: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedDate: Date;

  @ApiProperty()
  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
    eager: true,
  })
  images?: ProductImage[];

  @ManyToOne(() => User, (user) => user.products, {
    onDelete: 'CASCADE',
    eager: true, // allows to return which user created the product
  })
  user: User;

  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) {
      this.slug = this.title;
    }

    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }
}
