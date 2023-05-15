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
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({
    type: 'text',
    unique: true,
  })
  title: string;

  @ApiProperty()
  @Column({
    type: 'float',
    default: 0,
  })
  price: number;

  @ApiProperty()
  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @ApiProperty()
  @Column({
    type: 'text',
    unique: true,
  })
  slug: string;

  @ApiProperty()
  @Column({
    type: 'int',
    default: 0,
  })
  stock: number;

  @ApiProperty()
  @Column({
    type: 'text',
    array: true,
  })
  sizes: string[];

  @ApiProperty()
  @Column({
    type: 'text',
  })
  gender: string;

  @ApiProperty()
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
