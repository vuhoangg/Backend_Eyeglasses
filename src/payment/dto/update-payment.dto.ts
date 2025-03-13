import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentDto } from './create-payment.dto';
import { IsOptional } from 'class-validator';

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {
    @IsOptional()
    isActive?: boolean;
}
