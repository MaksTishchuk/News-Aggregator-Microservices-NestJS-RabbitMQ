import * as path from 'path';
import * as fs from 'fs';
import * as shortId from 'shortid';
import {HttpException, HttpStatus} from "@nestjs/common";
import {RpcException} from "@nestjs/microservices";

export const createFile = (file): string => {
  try {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = shortId.generate() + '.' + fileExtension;
    const filePath = path.resolve(__dirname, '..', 'uploads');
    const fullPath = path.resolve(filePath, fileName)
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, {recursive: true});
    }
    const buf = Buffer.from(file.buffer)
    fs.writeFileSync(fullPath, buf);
    return fileName
  } catch (err) {
    throw new RpcException(new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR));
  }
}

export const removeFile = (filePath:string) => {
  const fullFilePath = path.resolve(__dirname, '..', 'uploads', filePath);
  try {
    fs.unlinkSync(fullFilePath);
  } catch (err) {
    console.log('File with this path was not found!')
  }
}