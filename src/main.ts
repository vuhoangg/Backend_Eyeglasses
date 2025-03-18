import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  config();
  app.useStaticAssets(join(__dirname, '..', 'public')); // Serve static files from the 'public' directory
  // app.setGlobalPrefix('api');

   // Bật CORS
   app.enableCors({
    origin: 'http://localhost:3009', // Chỉ cho phép React frontend truy cập
    methods: 'GET,POST,PUT,PATCH,DELETE',
    allowedHeaders: 'Content-Type, Authorization, folder_type',
    credentials: true, // Nếu cần gửi cookie hoặc token
  });
  const dataSource = app.get(DataSource);
  try {
    await dataSource.query('SELECT 1'); // Kiểm tra kết nối
    console.log('Đã kết nối đến DB!');
  } catch (error) {
    console.error('Lỗi kết nối DB:', error.message);
  }
  await app.listen(process.env.PORT ?? 8082);
}
bootstrap();
