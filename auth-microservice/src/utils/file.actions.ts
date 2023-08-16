import * as path from 'path';
import * as fs from 'fs';
import * as shortId from 'shortid';
import * as sharp from 'sharp'
import {HttpException, HttpStatus} from "@nestjs/common";
import {RpcException} from "@nestjs/microservices";

export const createFile = async (file): Promise<string> => {
  try {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = shortId.generate() + '.' + fileExtension;
    const filePath = path.resolve(__dirname, '..', '..', 'src', 'storage', 'uploads');
    const fullPath = path.resolve(filePath, fileName)
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, {recursive: true});
    }
    const buf: Buffer = Buffer.from(file.buffer)
    const resizedImage: Buffer = await resizeImage(buf)
    fs.writeFileSync(fullPath, resizedImage);
    return fileName
  } catch (err) {
    throw new RpcException(new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR));
  }
}

export const removeFile = (filePath: string) => {
  const fullFilePath = path.resolve(__dirname, '..', '..', 'src', 'storage', 'uploads', filePath);
  try {
    fs.unlinkSync(fullFilePath);
  } catch (err) {
    console.log('File with this path was not found!')
  }
}

const resizeImage = async (imageBuffer: Buffer): Promise<Buffer> => {
  const imageWidth = 500
  const imageHeight = 500

  // Обрезка изобаржения в пропорции до нужного размера с сохранением пропорций
  const resizedImageBuffer = await sharp(imageBuffer)
    .resize({width: imageWidth, height: imageHeight, fit: 'inside'})
    .toBuffer();

  const metadata = await sharp(resizedImageBuffer).metadata();
  const width = metadata.width || 0;
  const height = metadata.height || 0;

  // Определение размера области для обрезки
  const targetSize = Math.min(width, height, 500);
  const left = Math.max(0, Math.floor((width - targetSize) / 2));
  const top = Math.max(0, Math.floor((height - targetSize) / 2));

  // Обрезка уменьшенного изображения
  return await sharp(resizedImageBuffer)
    .extract({left, top, width: targetSize, height: targetSize})
    .toBuffer()
}