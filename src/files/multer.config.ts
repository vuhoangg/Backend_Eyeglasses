import { Injectable } from "@nestjs/common";
import { MulterModuleOptions, MulterOptionsFactory } from "@nestjs/platform-express";
import * as fs from "fs";
import { diskStorage } from "multer";
import path, { join } from "path";

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {

  getRootPath = () => {
    return process.cwd();
  };

  ensureExists(targetDirectory: string) {
    try {
      fs.mkdirSync(targetDirectory, { recursive: true });
      console.log('Directory successfully created, or it already exists.');
    } catch (error: any) {
      switch (error.code) {
        case 'EEXIST':
          console.error('Error: Directory already exists but is not a folder.');
          break;
        case 'ENOTDIR':
          console.error(
            'Error: A parent path contains a file with the same name as the directory you are trying to create.'
          );
          break;
        default:
          console.error('Error: Permission denied or another issue occurred.', error);
          break;
      }
    }
  }

  createMulterOptions(): MulterModuleOptions {
    return {
      storage: diskStorage({
        destination: (req, file, cb) => {
        console.log('Incoming file:', file);
          const folder = req?.headers?.folder_type ?? "default";
          const folderPath = `public/images/${folder}`;
          this.ensureExists(folderPath);
          cb(null, join(this.getRootPath(), folderPath));
        },
        filename: (req, file, cb) => {

            if (!file || !file.originalname) {
                console.error('File is missing or originalname is undefined:', file);
                return cb(new Error('File data is invalid or missing'), false as any);
              }
          // Get image extension
          console.log("check file.originalname ", file.originalname) ;
          
        //   const extName = path.extname(file.originalname);
        //   console.log("check extName ", extName ) ;
        //   // Get image's name (without extension)
        //   const baseName = path.basename(file.originalname, extName);
          

          const finalName = `${Date.now()}-${file.originalname}`;

          //const finalName = `${baseName}-${Date.now()}${extName}`;
          cb(null, finalName);
        },
      }),
    };
  }
}