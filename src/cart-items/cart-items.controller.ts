import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Request,
  Query,
  ParseIntPipe,
  NotFoundException,
  HttpException,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CartItemsService } from './cart-items.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

interface QueryDto {
  cart_id?: number;
  product_id?: number;
  page?: number;
  limit?: number;
}

@Controller('cart-items')
export class CartItemsController {
  constructor(private readonly cartItemsService: CartItemsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createCartItemDto: CreateCartItemDto,@Request() req) {
    console.log('req.user:', req.user); // Kiểm tra req.user
      try {
          const cartItem = await this.cartItemsService.create(createCartItemDto, req.user.userId);
          return {
              statusCode: HttpStatus.CREATED,
              message: 'CartItem created successfully',
              data: cartItem,
          };
      } catch (error) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
  }

  @Get()
  async findAll(@Query() query: QueryDto) {
      try {
          const cartItems = await this.cartItemsService.findAll(query);
          return {
              statusCode: HttpStatus.OK,
              message: 'CartItems fetched successfully',
              data: cartItems,
          };
      } catch (error) {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
      try {
          const cartItem = await this.cartItemsService.findOne(id);
          return {
              statusCode: HttpStatus.OK,
              message: 'CartItem fetched successfully',
              data: cartItem,
          };
      } catch (error) {
          if (error instanceof NotFoundException) {
              throw new NotFoundException(error.message);
          }
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
  }

  @Patch(':id')
  async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
      try {
          const cartItem = await this.cartItemsService.update(id, updateCartItemDto);
          return {
              statusCode: HttpStatus.OK,
              message: 'CartItem updated successfully',
              data: cartItem,
          };
      } catch (error) {
          if (error instanceof NotFoundException) {
              throw new NotFoundException(error.message);
          }
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
      try {
          await this.cartItemsService.delete(id);
          return {
              statusCode: HttpStatus.OK,
              message: 'CartItem deleted successfully',
          };
      } catch (error) {
          if (error instanceof NotFoundException) {
              throw new NotFoundException(error.message);
          }
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
  }
   // **** ENDPOINT MỚI ĐỂ XÓA CỨNG GIỎ HÀNG CỦA USER ****
   @Delete('/my-cart/clear') // Sử dụng route cụ thể hơn, ví dụ /clear
   @UseGuards(JwtAuthGuard) // Bảo vệ endpoint
   async clearMyCartHard(@Request() req) {
       const userId = req.user?.userId;
       if (!userId) {
           throw new HttpException('User information missing in token payload', HttpStatus.UNAUTHORIZED);
       }
 
       try {
           console.log(`Request received to HARD DELETE cart for user ${userId}`);
           // Gọi hàm service xóa cứng mới
           const result = await this.cartItemsService.clearUserCartHard(userId);
 
           return {
               statusCode: HttpStatus.OK,
               message: `Successfully hard deleted active cart items for the user.`,
               data: {
                   itemsAffected: result.affected ?? 0 // Lấy số lượng bị ảnh hưởng
               }
           };
       } catch (error) {
           console.error(`Error hard deleting cart for user ${userId}:`, error);
           throw new HttpException(error.message || 'Failed to clear user cart items', HttpStatus.INTERNAL_SERVER_ERROR);
       }
   }
   // **** KẾT THÚC ENDPOINT MỚI ****

}