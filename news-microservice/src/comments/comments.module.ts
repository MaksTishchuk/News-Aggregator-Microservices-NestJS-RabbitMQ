import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {ProxyRmqModule} from "../proxy-rmq/proxy-rmq.module";
import {CommentEntity} from "../entities/comment.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentEntity]),
    ProxyRmqModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService]
})
export class CommentsModule {}
