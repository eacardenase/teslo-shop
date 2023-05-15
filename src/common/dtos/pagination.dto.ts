import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    default: 10,
    description: 'How many rows you need.',
    required: false,
  })
  @IsOptional()
  @IsPositive()
  @Type(() => Number) // similar to enableImplicitConversions: true
  limit?: number;

  @ApiProperty({
    default: 0,
    description: 'How many rows to skip.',
    required: false,
  })
  @IsOptional()
  @Min(0)
  @Type(() => Number) // and is more optimal than it
  offset?: number;
}
