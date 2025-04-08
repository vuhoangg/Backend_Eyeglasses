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
    console.log("ProductService: getBestSellingProducts function START");

    try {
      // --- DATABASE CONNECTION TEST ---
      try {
        console.log("ProductService: Database connection test - START");
        await this.productRepository.query('SELECT 1'); // Simple test query
        console.log("ProductService: Database connection test - SUCCESSFUL");
      } catch (dbError) {
        console.error("ProductService: Database connection test - FAILED:", dbError);
        throw new Error("Database connection failed. See server logs for details.");
      }
      // --- END DATABASE CONNECTION TEST ---

      // 1. Lấy tất cả OrderItems
      const allOrderItems = await this.orderItemRepository.find({
        relations: ['product'], // Load product relation
      });
      console.log("ProductService: Fetched allOrderItems - Count:", allOrderItems.length);

      // 2. Đếm số lượng sản phẩm đã bán cho mỗi productId
      const productSalesCount = new Map<number, number>();
      for (const orderItem of allOrderItems) {
        const productId = orderItem.product.id;
        const quantity = orderItem.quantity;
        productSalesCount.set(productId, (productSalesCount.get(productId) || 0) + quantity);
      }
      console.log("ProductService: Calculated productSalesCount - Map size:", productSalesCount.size);

      // 3. Sắp xếp sản phẩm theo số lượng bán giảm dần
      const sortedProductSales = Array.from(productSalesCount.entries()).sort(
        ([, quantityA], [, quantityB]) => quantityB - quantityA
      );
      console.log("ProductService: Sorted productSales - Top 3:", sortedProductSales.slice(0, 3));

      // 4. Lấy top 5 product IDs bán chạy nhất
      const topSellingProductIds = sortedProductSales.slice(0, 8).map(([productId]) => productId);
      console.log("ProductService: Top Selling Product IDs:", topSellingProductIds);

      // 5. **Lấy đầy đủ thông tin chi tiết của top sản phẩm từ bảng Product, including relations**
      const topSellingProductsDetails = await this.productRepository.find({
        where: { id: In(topSellingProductIds) },
        relations: ['category', 'brand'], // **Load category and brand relations here**
      });
      console.log("ProductService: Fetched topSellingProductsDetails - Count:", topSellingProductsDetails.length);

      // 6. **Combine full product details with quantitySold**
      const bestSellingProductsData = topSellingProductsDetails.map(product => {
        return {
          ...instanceToPlain(product), // Include ALL product details
          quantitySold: productSalesCount.get(product.id) || 0, // Add quantitySold
        };
      });
      console.log("ProductService: Created bestSellingProductsData - Count:", bestSellingProductsData.length);

      console.log("ProductService: getBestSellingProducts function END - Success");
      return bestSellingProductsData;


    } catch (error) {
      console.error("ProductService: getBestSellingProducts function ERROR:", error);
      throw error;
    }
  }


  async getLatestProducts(): Promise<any> {
    const latestProducts = await this.productRepository.find({
      where: { isActive: true },
      order: { creationDate: 'DESC' },
      take: 4, // Limit to 5 latest products
      relations: ['category', 'brand'], // Optional: Load relations if needed
    });
    return instanceToPlain(latestProducts);
  }


}