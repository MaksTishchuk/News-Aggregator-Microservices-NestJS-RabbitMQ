import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import {ProxyRmqModule} from "../proxy-rmq/proxy-rmq.module";

@Module({
  imports: [ProxyRmqModule],
  controllers: [CommentsController],
  providers: [CommentsService]
})
export class CommentsModule {}
