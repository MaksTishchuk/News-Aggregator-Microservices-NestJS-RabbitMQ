import {Injectable} from '@nestjs/common';
import {ClientProxyRMQ} from "../proxy-rmq/client-proxy-rmq";
import {lastValueFrom} from "rxjs";
import {File} from 'multer'
import {CreateNewsDto} from "./dto/create-news.dto";
import {PaginationDto} from "../common/dto/pagination.dto";
import {SearchNewsDto} from "./dto/search-news.dto";
import {UpdateNewsDto} from "./dto/update-news.dto";
import {
  ICreateNewsRequestContract, IDeleteNewsRequestContract, IDeleteNewsResponseContract,
  IFindOneNewsResponseContract, IGetAllNewsRequestContract, IGetAllNewsResponseContract,
  IGetFilesByNewsIdResponseContract, IGetFilesByNewsIdsListResponseContract, IGetUsersByIdsResponseContract,
  ISearchNewsRequestContract, ISearchNewsResponseContract, IUpdateNewsRequestContract,
  IUsersSubscriptionsResponseContract, IUserSubscriptionNewsRequestContract, IUserSubscriptionNewsResponseContract
} from "./contracts";
import {INewsWithAuthor} from "./interfaces/news-with-author.interface";
import {INewsWithAuthorFiles} from "./interfaces/news-with-author-files";
import {SearchNewsInterface} from "./interfaces/search-news.interface";
import {INewsEntity} from "./interfaces/news-entity.interface";
import {IAuthorEntityShort} from "./interfaces/author-entity-short.interface";

@Injectable()
export class NewsService {
  constructor(private clientProxyRMQ: ClientProxyRMQ) {}

  private clientNews = this.clientProxyRMQ.getClientProxyNewsInstance()
  private clientAuth = this.clientProxyRMQ.getClientProxyAuthInstance()
  private clientFiles = this.clientProxyRMQ.getClientProxyFilesInstance()

  async createNews(
    authorId: number, dto: CreateNewsDto, images: File[], videos: File[]
  ): Promise<{ success: boolean, message: string }> {
    const payload: ICreateNewsRequestContract = {newsDto: {authorId, ...dto}, images, videos}
    this.clientNews.emit('create-news', payload)
    return {success: true, message: 'The news has been sent for processing and will be available soon!'}
  }

  async findAllNews(dto: PaginationDto): Promise<INewsWithAuthorFiles[]> {
    const payload: IGetAllNewsRequestContract = {...dto}
    const newsResponse = this.clientNews.send('find-all-news', payload)
    const news: IGetAllNewsResponseContract = await lastValueFrom(newsResponse)
    const newsWithAuthors: INewsWithAuthor[] = await this.addAuthorToNewsArray(news)
    return await this.addImagesToNewsArray(newsWithAuthors)
  }

  async getUserSubscriptionNews(userId: number, dto: PaginationDto): Promise<INewsWithAuthorFiles[]> {
    const userSubscriptionsResponse = this.clientAuth.send('user-subscriptions', userId)
    const userSubscriptions: IUsersSubscriptionsResponseContract = await lastValueFrom(userSubscriptionsResponse)
    const authorIds: number[] = userSubscriptions.map((user) => user.id)
    const payload: IUserSubscriptionNewsRequestContract = {authorIds, pagination: dto}
    const newsResponse = this.clientNews.send('user-subscriptions-news', payload)
    const news: IUserSubscriptionNewsResponseContract = await lastValueFrom(newsResponse)
    const newsWithAuthor: INewsWithAuthor[] = news.map((news) => {
      const author = userSubscriptions.find((author) => author.id === news.authorId);
      let newsWithAuthor
      if (author) newsWithAuthor = {...news, author}
      else newsWithAuthor = {...news, author: undefined}
      return newsWithAuthor;
    })
    return await this.addImagesToNewsArray(newsWithAuthor)
  }

  async searchNews(dto: SearchNewsDto): Promise<SearchNewsInterface> {
    const payload: ISearchNewsRequestContract = {...dto}
    const response = this.clientNews.send('search-news', payload)
    let newsResponse: ISearchNewsResponseContract = await lastValueFrom(response)
    const newsWithAuthors: INewsWithAuthor[] = await this.addAuthorToNewsArray(newsResponse.news)
    const newsWithImages: INewsWithAuthorFiles[] = await this.addImagesToNewsArray(newsWithAuthors)
    return {news: newsWithImages, total: newsResponse.total}
  }

  async findOneNews(id: number): Promise<INewsWithAuthorFiles> {
    const newsResponse = this.clientNews.send('find-one-news', id)
    let news: IFindOneNewsResponseContract = await lastValueFrom(newsResponse)
    const newsWithAuthor: INewsWithAuthor = await this.addAuthorToNews(news)
    return await this.addFilesToNews(newsWithAuthor)
  }

  async updateNews(
    id: number, authorId: number, dto: UpdateNewsDto, images: File[], videos: File[]
  ): Promise<{ success: boolean, message: string }> {
    const payload: IUpdateNewsRequestContract = {
      newsDto: {id, authorId, ...dto}, images: images ? images : undefined, videos: videos ? videos : undefined
    }
    this.clientNews.emit('update-news', payload)
    return {success: true, message: 'The news has been sent for processing and will be available soon!'}
  }

  async deleteNews(id: number, authorId: number): Promise<IDeleteNewsResponseContract> {
    const payload: IDeleteNewsRequestContract = {id, authorId}
    const response = this.clientNews.send('delete-news', payload)
    return await lastValueFrom(response)
  }

  private async addAuthorToNews(news: INewsEntity): Promise<INewsWithAuthor> {
    const authorResponse = this.clientAuth.send('get-short-user-info-by-id', news.authorId)
    const author: IAuthorEntityShort = await lastValueFrom(authorResponse)
    return  {...news, author}
  }

  private async addFilesToNews(news: INewsWithAuthor): Promise<INewsWithAuthorFiles> {
    let newsWithFiles
    if (news.isImages || news.isVideos) {
      const filesResponse = this.clientFiles.send('get-files-by-news-id', news.id)
      const files: IGetFilesByNewsIdResponseContract = await lastValueFrom(filesResponse)
      newsWithFiles = {...news, images: files.imagesUrls, videos: files.videosUrls}
    } else newsWithFiles = {...news, images: [], videos: []}
    return newsWithFiles
  }

  private async addAuthorToNewsArray(news: INewsEntity[]): Promise<INewsWithAuthor[]> {
    const authorIds: number[] = Array.from(new Set(news.map((item) => item.authorId)))
    const authorResponse = this.clientAuth.send('get-users-by-ids', authorIds)
    const authors: IGetUsersByIdsResponseContract = await lastValueFrom(authorResponse)
    return news.map((item) => {
      const author = authors.find((author) => author.id === item.authorId);
      return {...item, author}
    })
  }

  private async addImagesToNewsArray(news): Promise<INewsWithAuthorFiles[]> {
    const newsIds: number[] = news.map((item) => item.id)
    const newsFilesResponse = this.clientFiles.send('get-files-by-news-ids-list', newsIds)
    const newsFiles: IGetFilesByNewsIdsListResponseContract = await lastValueFrom(newsFilesResponse)
    return news.map((news) => {
      if (news.isImages || news.isVideos) {
        const oneNewsFiles = newsFiles.find((item) => item.newsId === news.id);
        if (oneNewsFiles) news.images = oneNewsFiles.images
        if (oneNewsFiles) news.videos = oneNewsFiles.videos
      }
      if (!news.images) news.images = []
      if (!news.videos) news.videos = []
      return news
    })
  }
}
