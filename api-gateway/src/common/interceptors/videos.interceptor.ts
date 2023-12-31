import { Injectable, NestInterceptor, ExecutionContext, HttpStatus, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { HttpException } from '@nestjs/common/exceptions/http.exception';

@Injectable()
export class VideosInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    if (request.files.videos) {
      const maxFileSize = 20000000
      const videos = request.files.videos;
      for (const video of videos) {
        if (!video.mimetype.startsWith('video/mp4')) {
          throw new HttpException(`Invalid video extension! Only mp4!`, HttpStatus.UNPROCESSABLE_ENTITY
          )
        }
        if (video.size > maxFileSize) {
          throw new HttpException(
            `Video size exceeds the limit of ${maxFileSize} byte, but you sent image with ${video.size} byte!`,
            HttpStatus.UNPROCESSABLE_ENTITY
          )
        }
      }
    }
    return next.handle();
  }
}