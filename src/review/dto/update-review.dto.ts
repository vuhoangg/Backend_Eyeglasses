import { PartialType } from '@nestjs/mapped-types';
import { CreateReviewDto } from './create-review.dto';
import { IsInt } from 'class-validator';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {
    @IsInt()
    userId: number;
  
    @IsInt()
    productId: number;
}
