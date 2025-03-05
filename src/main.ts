import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  config();
  // app.setGlobalPrefix('api');
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
