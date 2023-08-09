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
  private clientFiles = this.clientProxyRMQ.getClientProxyFilesInstance()

  async createNews(id: number, dto: CreateNewsDto, images) {
    this.clientNews.emit('create-news', { newsDto: {authorId: id, ...dto}, images: images.images})
    return {message: 'The news has been sent for processing and will be available soon!'}
  }

  async findAllNews(dto: PaginationDto) {
    const newsResponse = this.clientNews.send('find-all-news', dto)
    let news = await lastValueFrom(newsResponse)
    news = await this.addAuthorToNewsArray(news)
    return await this.addImagesToNewsArray(news)
  }

  async getUserSubscriptionNews(userId: number, dto: PaginationDto) {
    const userSubscriptionsResponse = this.clientAuth.send('user-subscriptions', userId)
    const userSubscriptions = await lastValueFrom(userSubscriptionsResponse)
    const authorIds = userSubscriptions.map((user) => user.id)
    const newsResponse = this.clientNews.send('user-subscriptions-news', {authorIds, pagination: dto})
    let news = await lastValueFrom(newsResponse)
    news = news.map((news) => {
      const author = userSubscriptions.find((author) => author.id === news.authorId);
      if (author) news.author = author
      return news;
    })
    return await this.addImagesToNewsArray(news)
  }

  async searchNews(dto: SearchNewsDto) {
    const response = this.clientNews.send('search-news', dto)
    let newsResponse = await lastValueFrom(response)
    let news = await this.addAuthorToNewsArray(newsResponse.news)
    news = await this.addImagesToNewsArray(news)
    return {news, total: newsResponse.total}
  }

  async findOneNews(id: number) {
    const newsResponse = this.clientNews.send('find-one-news', id)
    let news = await lastValueFrom(newsResponse)
    news = await this.addAuthorToNews(news)
    if (news.isImages) await this.addImagesToNews(news)
    return news
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

  private async addImagesToNews(news) {
    const imagesResponse = this.clientFiles.send('get-images-by-news-id', news.id)
    news.images = await lastValueFrom(imagesResponse)
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

  private async addImagesToNewsArray(news) {
    const newsIds = news.map((item) => item.id)
    const newsImagesResponse = this.clientFiles.send('get-images-by-news-ids-list', newsIds)
    const newsImages = await lastValueFrom(newsImagesResponse)
    return news.map((news) => {
      if (news.isImages) {
        const oneNewsImages = newsImages.find((item) => item.newsId === news.id);
        if (oneNewsImages) news.images = oneNewsImages.images
      }
      if (!news.images) news.images = []
      return news
    })
  }
}
