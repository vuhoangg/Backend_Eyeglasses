import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { FindOptionsWhere } from 'typeorm';
import { instanceToPlain } from 'class-transformer';
import { User } from 'src/user/entities/user.entity';

interface QueryDto {
  user_id?: number;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async create(createCartDto: CreateCartDto): Promise<any> {
    const { user_id, ...cartData } = createCartDto;

    const user = await this.userRepository.findOneBy({ id: user_id });
    if (!user) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    }
    const cart = this.cartRepository.create({
      ...cartData,
      user: user,
    });

    const newCart = await this.cartRepository.save(cart);
    return instanceToPlain(newCart);
  }

  async findAll(query: QueryDto): Promise<any> {
    const where: FindOptionsWhere<Cart> = {
      isActive: true,
    };

    const { user_id, isActive, page = 1, limit = 10 } = query;

    if (user_id) {
      where.user = { id: user_id }; // Access user.id
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [data, total] = await this.cartRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: {
        creationDate: 'DESC',
      },
      relations: ['user', 'cartItems'],
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
    const cart = await this.cartRepository.findOne({
      where: { id, isActive: true },
      relations: ['user', 'cartItems'],
    });

    if (!cart) {
      throw new NotFoundException(`Cart with ID ${id} not found`);
    }

    return instanceToPlain(cart);
  }

  async update(id: number, updateCartDto: UpdateCartDto): Promise<any> {

    const { user_id,...cartData } = updateCartDto;

    const cart = await this.cartRepository.findOne({ where: { id } });

    if (!cart) {
      throw new NotFoundException(`Cart with ID ${id} not found`);
    }
     //Check xem có user id trong updateCartDto ko
     if(user_id) {
      const user = await this.userRepository.findOneBy({ id: user_id });
      if (!user) {
          throw new NotFoundException(`User with ID ${updateCartDto.user_id} not found`);
      }
      cart.user = user;
    }
    Object.assign(cart,updateCartDto);
    const updatedCart = await this.cartRepository.save(cart);
    return instanceToPlain(updatedCart);
  }

  async delete(id: number): Promise<void> {
    const cart = await this.cartRepository.findOne({ where: { id } });

    if (!cart) {
      throw new NotFoundException(`Cart with ID ${id} not found`);
    }

    cart.isActive = false;
    await this.cartRepository.save(cart);
  }
}