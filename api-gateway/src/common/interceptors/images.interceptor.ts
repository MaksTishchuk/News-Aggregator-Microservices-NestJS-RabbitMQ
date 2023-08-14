import { Injectable, NestInterceptor, ExecutionContext, HttpStatus, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import * as path from 'path';

@Injectable()
export class ImagesInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const images = request.files;

    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif']
    const maxFileSize = 5242880

    for (const image of images.images) {
      const fileExtension = path.extname(image.originalname).toLowerCase().replace('.', '');
      if (!allowedExtensions.includes(fileExtension)) {
        throw new HttpException(
          `Invalid image extension! Valid extensions: ${allowedExtensions}!`,
          HttpStatus.UNPROCESSABLE_ENTITY
        );
      }
      if (image.size > maxFileSize) {
        throw new HttpException(
          `Image size exceeds the limit ${maxFileSize} byte, but you sent image with ${image.size} byte!`,
          HttpStatus.UNPROCESSABLE_ENTITY
        );
      }
    }
    return next.handle();
  }
}