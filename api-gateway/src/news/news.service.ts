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
  private clientAuth = this.clientProxyRMQ.getClientProxyAuthInstance()

  async createNews(id: number, dto: CreateNewsDto) {
    const newsResponse = this.clientNews.send('create-news', { authorId: id, ...dto})
    const news = await lastValueFrom(newsResponse)
    return await this.addAuthorToNews(news)
  }

  async findAllNews(dto: PaginationDto) {
    const newsResponse = this.clientNews.send('find-all-news', dto)
    const news = await lastValueFrom(newsResponse)
    return await this.addAuthorToNewsArray(news)
  }

  async searchNews(dto: SearchNewsDto) {
    const response = this.clientNews.send('search-news', dto)
    const newsResponse = await lastValueFrom(response)
    const newsWithAuthors = await this.addAuthorToNewsArray(newsResponse.news)
    return {news: newsWithAuthors, total: newsResponse.total}
  }

  async findOneNews(id: number) {
    const newsResponse = this.clientNews.send('find-one-news', id)
    const news = await lastValueFrom(newsResponse)
    return await this.addAuthorToNews(news)
  }

  async updateNews(id: number, authorId: number, dto: UpdateNewsDto) {
    const newsResponse = this.clientNews.send('update-news', {id, authorId, ...dto})
    const news = await lastValueFrom(newsResponse)
    return await this.addAuthorToNews(news)
  }

  async deleteNews(id: number, authorId: number) {
    const response = this.clientNews.send('delete-news', {id, authorId})
    return await lastValueFrom(response)
  }

  private async addAuthorToNews(news) {
    const authorResponse = this.clientAuth.send('get-short-user-info-by-id', news.authorId)
    news.author = await lastValueFrom(authorResponse)
    return news
  }

  private async addAuthorToNewsArray(news) {
    const authorIds = Array.from(new Set(news.map((item) => item.authorId)))
    const authorResponse = this.clientAuth.send('get-users-by-ids', authorIds)
    const authors = await lastValueFrom(authorResponse)
    return news.map((news) => {
        const author = authors.find((author) => author.id === news.authorId);
        if (author) news.author = author
        return news;
      })
  }
}
