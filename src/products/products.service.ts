import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { instanceToPlain } from 'class-transformer';
import { QueryDto } from './dto/query.dto';
import { Category } from 'src/category/entities/category.entity';
import { Brand } from 'src/brand/entities/brand.entity';
import { ILike } from 'typeorm';
import { OrderItem } from 'src/order_items/entities/order_item.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category) // Inject Category repository
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Brand) // Inject Brand repository
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(OrderItem) // Inject OrderItem repository
    private readonly orderItemRepository: Repository<OrderItem>, // Inject OrderItem Repository
    
  ) {}

  async create(createProductDto: CreateProductDto): Promise<any> {
    const {  ...productDetails } = createProductDto; // Separate category_id and brand_id
     
    const product = this.productRepository.create({
      ...productDetails,
    });

    const newProduct = await this.productRepository.save(product);
    return instanceToPlain(newProduct);
  }

  async findAll(query: QueryDto): Promise<any> {
    const where: FindOptionsWhere<Product> = {
      isActive: true, // Default to only active products
    };

    const { name, category_id, brand_id, isActive, page = 1, limit = 10 } = query;

    if (name) {
      where.name = ILike(`%${name}%`);
    }

    if (category_id) {
      where.category_id = category_id;
    }

    if (brand_id) {
      where.brand_id = brand_id;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [data, total] = await this.productRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: {
        creationDate: 'DESC',
      },
      relations: ['category', 'brand'], // Load relations
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
    const product = await this.productRepository.findOne({
      where: { id, isActive: true }, // Only fetch active products
      relations: ['category', 'brand'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return instanceToPlain(product);
  }

 

  

  async update(id: number, updateProductDto: UpdateProductDto): Promise<any> {
    const { ...productDetails } = updateProductDto;

    const product = await this.productRepository.findOne({
      where: { id },
      // relations: ['category', 'brand'],
    });

    if (!product) {
      throw new NotFoundException('Product không tồn tại');
    }

    // Cập nhật các trường cơ bản
    Object.assign(product, productDetails);


    const updatedProduct = await this.productRepository.save(product);
    return instanceToPlain(updatedProduct);
  }

  async delete(id: number): Promise<void> {
    const product = await this.productRepository.findOne({where:{id}});
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    product.isActive = false;
    await this.productRepository.save(product);
  }




  async getBestSellingProducts(): Promise<any[]> { // Phiên bản thủ công hơn - ĐÃ SỬA HOÀN CHỈNH
    console.log("ProductService: getBestSellingProducts function START"); // <--- ADD THIS LOG

    try {
      // --- DATABASE CONNECTION TEST ---
      try {
        console.log("ProductService: Database connection test - START"); // <--- ADD THIS LOG
        await this.productRepository.query('SELECT 1'); // Simple test query
        console.log("ProductService: Database connection test - SUCCESSFUL"); // <--- ADD THIS LOG
      } catch (dbError) {
        console.error("ProductService: Database connection test - FAILED:", dbError); // <--- ADD THIS LOG
        throw new Error("Database connection failed. See server logs for details."); // Throw error to signal DB issue
      }
      // --- END DATABASE CONNECTION TEST ---


      // 1. Lấy tất cả OrderItems (có thể cần giới hạn nếu bảng order_items rất lớn)
      const allOrderItems = await this.orderItemRepository.find({
        relations: ['product'], // Load thông tin product để dùng sau
      });
      console.log("ProductService: Fetched allOrderItems - Count:", allOrderItems.length); // <--- ADD THIS LOG

      // 2. Tạo một Map để đếm số lượng sản phẩm đã bán cho mỗi productId
      const productSalesCount = new Map<number, number>();

      for (const orderItem of allOrderItems) {
        const productId = orderItem.product.id;
        const quantity = orderItem.quantity;

        if (productSalesCount.has(productId)) {
          productSalesCount.set(productId, (productSalesCount.get(productId) ?? 0) + quantity);
        } else {
          productSalesCount.set(productId, quantity);
        }
      }
      console.log("ProductService: Calculated productSalesCount - Map size:", productSalesCount.size); // <--- ADD THIS LOG


      // 3. Chuyển Map thành Array và sắp xếp theo số lượng bán giảm dần
      const sortedProductSales = Array.from(productSalesCount.entries()).sort(
        ([productIdA, quantityA], [productIdB, quantityB]) => quantityB - quantityA
      );
      console.log("ProductService: Sorted productSales - Top 3:", sortedProductSales.slice(0, 3)); // <--- ADD THIS LOG (top 3 for brevity)


      // 4. Lấy top 5 sản phẩm bán chạy nhất (hoặc ít hơn nếu có ít sản phẩm hơn 5)
      const topSellingProductIds = sortedProductSales.slice(0, 5).map(([productId, quantity]) => productId);
      console.log("ProductService: Top Selling Product IDs:", topSellingProductIds); // <--- ADD THIS LOG


      // 5. Lấy thông tin chi tiết của top sản phẩm từ bảng Product
      const topSellingProductsDetails = await this.productRepository.find({
        where: { id: In(topSellingProductIds) },
      });
      console.log("ProductService: Fetched topSellingProductsDetails - Count:", topSellingProductsDetails.length); // <--- ADD THIS LOG


      // 6. Kết hợp thông tin sản phẩm và số lượng bán để trả về kết quả
      const bestSellingProductsData = topSellingProductsDetails.map(product => {
        return {
          productName: product.name,
          quantitySold: productSalesCount.get(product.id) || 0, // Lấy số lượng bán từ Map
        };
      });
      console.log("ProductService: Created bestSellingProductsData - Count:", bestSellingProductsData.length); // <--- ADD THIS LOG


      console.log("ProductService: getBestSellingProducts function END - Success"); // <--- ADD THIS LOG
      return bestSellingProductsData;

    } catch (error) {
      console.error("ProductService: getBestSellingProducts function ERROR:", error); // <--- ADD THIS LOG (whole error object)
      throw error; // Hoặc xử lý lỗi theo cách phù hợp với ứng dụng của bạn
    }
  }
}