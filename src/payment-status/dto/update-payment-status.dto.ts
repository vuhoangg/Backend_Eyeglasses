import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentStatusDto } from './create-payment-status.dto';
import { IsOptional } from 'class-validator';

export class UpdatePaymentStatusDto extends PartialType(CreatePaymentStatusDto) {
    @IsOptional()
    isActive?: boolean;
}
