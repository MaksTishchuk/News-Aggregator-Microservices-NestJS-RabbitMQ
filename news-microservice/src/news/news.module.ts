import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {NewsEntity} from "../entities/news.entity";
import {ProxyRmqModule} from "../proxy-rmq/proxy-rmq.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([NewsEntity]),
    ProxyRmqModule,
  ],
  controllers: [NewsController],
  providers: [NewsService]
})
export class NewsModule {}
