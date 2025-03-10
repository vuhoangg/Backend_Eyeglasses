import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { instanceToPlain } from 'class-transformer';
import { QueryDto } from './dto/query.dto';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ReviewService {
  constructor(
  
    @InjectRepository(Review) // Inject Review repository
    private readonly ReviewRepository: Repository<Review>,
    @InjectRepository(Product) // Inject Product repository
    private readonly ProductRepository: Repository<Product>,
        @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}



  async create(createReviewDto: CreateReviewDto): Promise<any> {
    const { productId, userId, ...reviewDetails } = createReviewDto;

    // Fetch the user and product first:
        const product = await this.ProductRepository.findOneBy({ id: productId });
        const user = await this.userRepository.findOneBy({ id: userId });
    if (!product || !user) {
        throw new NotFoundException(`Product or User not found`);
    }

    const review = this.ReviewRepository.create({
      ...reviewDetails,
      product : product, // assign the product entity
            user: user, // Assign the user entity
      product_Id: productId,
            user_Id: userId,
    });

    const newReview = await this.ReviewRepository.save(review);
    return instanceToPlain(newReview);
  }

  async findAll(query: QueryDto): Promise<any> {
    const where: FindOptionsWhere<Review> = {
      isActive: true, // Default to only active Reviews
    };
    const {  isActive, page = 1, limit = 10 } = query;
  
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    const [data, total] = await this.ReviewRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: {
        creationDate: 'DESC',
      },
      // relations: ['product'], // Load relations
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
    const Review = await this.ReviewRepository.findOne({
      where: { id, isActive: true }, // Only fetch active Reviews
    });

    if (!Review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return instanceToPlain(Review);
  }

 

  

  async update(id: number, updateReviewDto: UpdateReviewDto): Promise<any> {
    const { productId, userId,...ReviewDetails } = updateReviewDto;

    const review = await this.ReviewRepository.findOne({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review không tồn tại');
    }
     //Update userId và productID
     if (userId) {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      review.user = user;
      review.user_Id = userId;
    }

    if (productId) {
      const product = await this.ProductRepository.findOneBy({ id: productId });
      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }
      review.product = product;
      review.product_Id = productId;
    }
    // Update Review 
    Object.assign(review, ReviewDetails);
    const updatedReview = await this.ReviewRepository.save(review);
    return instanceToPlain(updatedReview);
  }

  async softDelete(id: number): Promise<void> {
    const Review = await this.ReviewRepository.findOne({where:{id}});
    if (!Review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    Review.isActive = false;
    await this.ReviewRepository.save(Review);
  }
}

