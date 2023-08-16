import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {Model} from "mongoose";
import {FilesDocument, FilesModel} from "./models/files.model";
import {InjectModel} from "@nestjs/mongoose";
import * as path from 'path';
import * as fs from 'fs';
import * as shortId from 'shortid';
import { File } from 'multer'
import {RpcException} from "@nestjs/microservices";
import {ConfigService} from "@nestjs/config";
import {IGetImagesByNewsIdsListResponseContract} from "./contracts/get-images-by-news-ids-list/get-images-by-news-ids-list.response.contract";

@Injectable()
export class FilesService {

  constructor(
    @InjectModel(FilesModel.name) private readonly filesModel: Model<FilesDocument>,
    private configService: ConfigService
  ) {
  }

  async createImages(newsId: number, images: File[]): Promise<void> {
    if (images) {
      const imagesArray: string[] = []
      images.forEach((image) => imagesArray.push(this.createFile(image)))
      await this.filesModel.create({newsId, images: imagesArray, createdAt: Date.now()})
    }
  }

  async getImagesUrls(newsId: number): Promise<string[]> {
    const newsImages = await this.filesModel.findOne({newsId}).select('-__v')
    const imagesUrls = []
    if (!newsImages) return imagesUrls
    newsImages.images.forEach((image) => {
      image = `${this.configService.get<string>('SERVER_URL')}/images/${image}`
      imagesUrls.push(image)
    })
    return imagesUrls
  }

  async getImagesListByNewsIds(newsIdsList: number[]): Promise<IGetImagesByNewsIdsListResponseContract> {
    const newsImagesByIds = await this.filesModel.find({newsId: {"$in": newsIdsList}})
    if (!newsImagesByIds) return []
    let newsImagesList = []
    newsImagesByIds.forEach((newsImages) => {
      const newsData = {}
      const imagesUrls = []
      newsImages.images.forEach((image) => {
        image = `${this.configService.get<string>('SERVER_URL')}/images/${image}`
        imagesUrls.push(image)
      })
      newsData['newsId'] = newsImages.newsId
      newsData['images'] = imagesUrls
      newsImagesList.push(newsData)
    })
    return newsImagesList
  }

  async updateNewsImages(newsId: number, images: File[]): Promise<{success: boolean, message: string}> {
    const newsImages = await this.filesModel.findOne({newsId}).select('-__v')
    const imagesArray: string[] = []
    images.forEach((image) => imagesArray.push(this.createFile(image)))
    if (newsImages) {
      await this.filesModel.updateOne({newsId}, {images: imagesArray, createdAt: Date.now()})
      newsImages.images.forEach((image) => this.removeFile(image))
    } else await this.filesModel.create({newsId, images: imagesArray, createdAt: Date.now()})
    return {success: true, message: `Images for news with id ${newsId} has been updated!`}
  }

  async deleteImages(newsId): Promise<void> {
    const newsImages = await this.filesModel.findOne({newsId}).select('-__v')
    if (newsImages) {
      await this.filesModel.deleteOne({newsId})
      newsImages.images.forEach((image) => this.removeFile(image))
    }
  }

  createFile(file): string {
    try {
      const fileExtension = file.originalname.split('.').pop();
      const fileName = shortId.generate() + '.' + fileExtension;
      const filePath = path.resolve(__dirname, '..', '..', 'src', 'storage', 'uploads');
      const fullPath = path.resolve(filePath, fileName)
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, {recursive: true});
      }
      const buf = Buffer.from(file.buffer)
      fs.writeFileSync(fullPath, buf);
      return fileName
    } catch (err) {
      throw new RpcException(new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  removeFile(filePath: string): void {
    const fullFilePath = path.resolve(__dirname, '..', '..', 'src', 'storage', 'uploads', filePath);
    try {
      fs.unlinkSync(fullFilePath);
    } catch (err) {
      console.log(`File with path ${fullFilePath} was not found!`)
    }
  }
}
