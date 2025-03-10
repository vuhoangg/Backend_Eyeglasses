import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  userId: number;

  @IsInt()
  productId: number;

  @IsString()
  comment: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

    
  @IsOptional()
  isActive?: boolean;
}

