import { Module } from '@nestjs/common';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import {ProxyRmqModule} from "../proxy-rmq/proxy-rmq.module";

@Module({
  imports: [ProxyRmqModule],
  controllers: [NewsController],
  providers: [NewsService]
})
export class NewsModule {}
