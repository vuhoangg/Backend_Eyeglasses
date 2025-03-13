// payment/dto/query.dto.ts
import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";

export class QueryDto{

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(1)
    page?: number ;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(1)
    limit?: number;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(1)
    isActive?: boolean ;
}