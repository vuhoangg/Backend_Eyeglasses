import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseFilePipeBuilder, HttpStatus } from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('fileUpload'))
    uploadFile(@UploadedFile(
    new ParseFilePipeBuilder()
    .addFileTypeValidator({
      fileType: '.(png|jpeg|image\/jpeg|jpg|image\/jpg|image\/png|txt|doc|docx|text\/plain|)',
      // fileType: 'jpeg',
    })
    .addMaxSizeValidator({
      maxSize: 90000000
    })
    .build({
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
    }),
  ) file: Express.Multer.File) {
    return{
      statusCode: HttpStatus.OK,
      message: 'upload successfully',
      fileName: file.filename
  
    }
  }
 


}
