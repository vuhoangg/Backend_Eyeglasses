import { Injectable } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';

@Injectable()
export class FilesService {
  private readonly baseUrl = 'https://api.datxe247.com'; // Thay bằng URL thực tế
  private readonly uploadDir = 'images'; // Thư mục lưu trữ

  // Hàm trả về đường dẫn đầy đủ của file
  getFullImagePath(filename: string): string {
    return `${this.baseUrl}/${this.uploadDir}/${filename}`;
  }

 
}
