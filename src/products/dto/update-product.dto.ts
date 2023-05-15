// import { PartialType } from '@nestjs/mapped-types';
import { PartialType } from '@nestjs/swagger'; // does the same as mapped-types

import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
