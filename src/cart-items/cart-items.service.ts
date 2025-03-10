import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { FindOptionsWhere } from 'typeorm';
import { instanceToPlain } from 'class-transformer';
import { CartItem } from './entities/cart-item.entity';
import { Cart } from 'src/carts/entities/cart.entity';
import { Product } from 'src/products/entities/product.entity';

interface QueryDto {
    cart_id?: number;
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
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createCartItemDto: CreateCartItemDto): Promise<any> {
    const {cart_id, product_id, ...CartItemDetails }= createCartItemDto;

    const cart = await this.cartRepository.findOneBy({ id: cart_id });
    if (!cart) {
      throw new NotFoundException(`Cart with ID ${cart_id} not found`);
    }

    const product = await this.productRepository.findOneBy({ id: product_id });
    if (!product) {
      throw new NotFoundException(`Product with ID ${product_id} not found`);
    }
    const cartItem = this.cartItemRepository.create(
      {
        ...CartItemDetails,
        cart: cart,
        product: product,
      }
    );
    const newCartItem = await this.cartItemRepository.save(cartItem);
    return instanceToPlain(newCartItem);
  }

  async findAll(query: QueryDto): Promise<any> {
    const where: FindOptionsWhere<CartItem> = {
      isActive: true,
    };
    const { cart_id, isActive, product_id, page = 1, limit = 10 } = query;

    if (cart_id) {
      where.cart = { id: cart_id }; // Access cart.id
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (product_id) {
      where.product = { id: product_id }; // Access product.id
    }

    const [data, total] = await this.cartItemRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: {
        creationDate: 'DESC',
      },
      relations: ['cart', 'product'],
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
      where: { id , isActive: true },
      relations: ['cart', 'product'],
    });

    if (!cartItem) {
      throw new NotFoundException(`CartItem with ID ${id} not found`);
    }

    return instanceToPlain(cartItem);
  }

  async update(id: number, updateCartItemDto: UpdateCartItemDto): Promise<any> {
    const { cart_id, product_id, ...CartItemDetails } = updateCartItemDto;
    const cartItem = await this.cartItemRepository.findOne({ where: { id } });

    if (!cartItem) {
      throw new NotFoundException(`CartItem with ID ${id} not found`);
    }

    if (cart_id) {
      const cart = await this.cartRepository.findOneBy({ id: cart_id });
      if (!cart) { //Fix sai logic , nếu không tìm thấy thì ném lỗi
        throw new NotFoundException(`Cart with ID ${cart_id} not found`);
      }
      cartItem.cart = cart;
    }
    if (product_id) {
      const product = await this.productRepository.findOneBy({ id: product_id });
      if (!product) {
        throw new NotFoundException(`Product with ID ${product_id} not found`);
      }
        cartItem.product = product // Sửa sai chính tả
    }
    
    Object.assign(cartItem, CartItemDetails); // sửa lại CartItemDetails

    const updatedCartItem = await this.cartItemRepository.save(cartItem);
    return instanceToPlain(updatedCartItem);
  }



  async delete(id: number): Promise<void> {
    const cartItem = await this.cartItemRepository.findOne({ where: { id } });

    if (!cartItem) {
      throw new NotFoundException(`Cart with ID ${id} not found`);
    }

    cartItem.isActive = false;
    await this.cartItemRepository.save(cartItem);
  }
}