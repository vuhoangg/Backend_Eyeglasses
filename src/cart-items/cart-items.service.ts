import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';

import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { FindOptionsWhere } from 'typeorm';
import { instanceToPlain } from 'class-transformer';
import { CartItem } from './entities/cart-item.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/user/entities/user.entity';

interface QueryDto {
    user_id?: number;
    product_id?: number;
    page?: number;
    limit?: number;
    isActive?: boolean;
}

@Injectable()
export class CartItemsService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createCartItemDto: CreateCartItemDto, userId: number): Promise<any> {
    const { product_id, ...CartItemDetails} = createCartItemDto;

    const user = await this.userRepository.findOneBy({ id:  userId });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId } not found`);
    }

    const product = await this.productRepository.findOneBy({ id: product_id });
    if (!product) {
      throw new NotFoundException(`Product with ID ${product_id} not found`);
    }

    const cartItem = this.cartItemRepository.create({
      ...CartItemDetails,
      user_id: userId, // Sử dụng userId từ token
      user: user,
      product: product,
    });

    const newCartItem = await this.cartItemRepository.save(cartItem);
    return instanceToPlain(newCartItem);
  }

  async findAll(query: QueryDto): Promise<any> {
    const where: FindOptionsWhere<CartItem> = {
      isActive: true,
    };
    const { user_id, isActive, product_id, page = 1, limit = 10 } = query;

    if (user_id) {
      where.user = { id: user_id };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (product_id) {
      where.product = { id: product_id };
    }

    const [data, total] = await this.cartItemRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: {
        creationDate: 'DESC',
      },
      relations: ['user', 'product'],
    });

    const totalPage = Math.ceil(total / limit);

    return {
      total,
      totalPage,
      page,
      limit,
      data: instanceToPlain(data),
    };
  }

  async findOne(id: number): Promise<any> {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id, isActive: true },
      relations: ['user', 'product'],
    });

    if (!cartItem) {
      throw new NotFoundException(`CartItem with ID ${id} not found`);
    }

    return instanceToPlain(cartItem);
  }

  async update(id: number, updateCartItemDto: UpdateCartItemDto): Promise<any> {
    const { user_id, product_id, ...CartItemDetails } = updateCartItemDto;
    const cartItem = await this.cartItemRepository.findOne({ where: { id } });

    if (!cartItem) {
      throw new NotFoundException(`CartItem with ID ${id} not found`);
    }

    if (user_id) {
      const user = await this.userRepository.findOneBy({ id: user_id });
      if (!user) {
        throw new NotFoundException(`User with ID ${user_id} not found`);
      }
      cartItem.user = user;
    }

    if (product_id) {
      const product = await this.productRepository.findOneBy({ id: product_id });
      if (!product) {
        throw new NotFoundException(`Product with ID ${product_id} not found`);
      }
      cartItem.product = product;
    }
    
    Object.assign(cartItem, CartItemDetails);

    const updatedCartItem = await this.cartItemRepository.save(cartItem);
    return instanceToPlain(updatedCartItem);
  }

  async delete(id: number): Promise<void> {
    const cartItem = await this.cartItemRepository.findOne({ where: { id } });

    if (!cartItem) {
      throw new NotFoundException(`CartItem with ID ${id} not found`);
    }

    cartItem.isActive = false;
    await this.cartItemRepository.save(cartItem);
  }


  // **** HÀM XÓA CỨNG TẤT CẢ CART ITEMS CỦA USER (Đơn giản hóa) ****
  /**
   * Performs a HARD DELETE of all active cart items for a specific user.
   * @param userId - The ID of the user whose cart items are to be deleted.
   * @returns The result of the delete operation (DeleteResult).
   */
  async clearUserCartHard(userId: number): Promise<DeleteResult> {
    console.log(`Attempting to HARD DELETE active cart items for user ${userId}`);

    // Optional: Kiểm tra xem user có tồn tại không trước khi xóa
    // const userExists = await this.userRepository.existsBy({ id: userId });
    // if (!userExists) {
    //   console.warn(`User with ID ${userId} not found. No cart items to delete.`);
    //   // Trả về một DeleteResult rỗng hoặc ném lỗi tùy logic
    //   return { raw: [], affected: 0 };
    // }

    // Điều kiện xóa: cart items của user này VÀ đang active
    const criteria: FindOptionsWhere<CartItem> = {
        user: { id: userId },
        isActive: true // Chỉ xóa những item đang active
    };

    // Thực hiện xóa cứng trực tiếp
    const deleteResult = await this.cartItemRepository.delete(criteria);
    console.log(`Hard delete result for user ${userId}:`, deleteResult);

    // Trả về kết quả trực tiếp từ TypeORM
    return deleteResult;
}
// **** KẾT THÚC HÀM MỚI ****

  
}