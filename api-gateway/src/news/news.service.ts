import { Injectable } from '@nestjs/common';
import {ClientProxyRMQ} from "../proxy-rmq/client-proxy-rmq";
import {lastValueFrom} from "rxjs";
import {CreateNewsDto} from "./dto/create-news.dto";
import {PaginationDto} from "../common/dto/pagination.dto";
import {SearchNewsDto} from "./dto/search-news.dto";
import {UpdateNewsDto} from "./dto/update-news.dto";

@Injectable()
export class NewsService {
  constructor(private clientProxyRMQ: ClientProxyRMQ) {}

  private clientNews = this.clientProxyRMQ.getClientProxyNewsInstance()

  async createNews(id: number, dto: CreateNewsDto) {
    const response = this.clientNews.send('create-news', { authorId: id, ...dto})
    return await lastValueFrom(response)
  }

  async findAllNews(dto: PaginationDto) {
    const response = this.clientNews.send('find-all-news', dto)
    return await lastValueFrom(response)
  }

  async searchNews(dto: SearchNewsDto) {
    const response = this.clientNews.send('search-news', dto)
    return await lastValueFrom(response)
  }

  async findOneNews(id: number) {
    const response = this.clientNews.send('find-one-news', id)
    return await lastValueFrom(response)
  }

  async updateNews(id: number, authorId: number, dto: UpdateNewsDto) {
    const response = this.clientNews.send('update-news', {id, authorId, ...dto})
    return await lastValueFrom(response)
  }

  async deleteNews(id: number, authorId: number) {
    const response = this.clientNews.send('delete-news', {id, authorId})
    return await lastValueFrom(response)
  }
}
