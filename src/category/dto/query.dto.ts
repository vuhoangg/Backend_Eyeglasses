import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";





export class QueryDto{

    @IsString()
    @IsNotEmpty()
    name: string;


    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(1)
    isActive?: boolean ;


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
    


}