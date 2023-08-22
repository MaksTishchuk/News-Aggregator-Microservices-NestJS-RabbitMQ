import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {Model} from "mongoose";
import {FilesDocument, FilesModel} from "./models/files.model";
import {InjectModel} from "@nestjs/mongoose";
import * as path from 'path';
import * as fs from 'fs';
import * as shortId from 'shortid';
import * as sharp from 'sharp'
import {File} from 'multer'
import {RpcException} from "@nestjs/microservices";
import {ConfigService} from "@nestjs/config";
import {
  IGetFilesByNewsIdResponseContract,
  IGetFilesByNewsIdsListResponseContract
} from "./contracts";
import {FileTypeEnum} from "./enums/file-type.enum";

@Injectable()
export class FilesService {

  constructor(
    @InjectModel(FilesModel.name) private readonly filesModel: Model<FilesDocument>,
    private configService: ConfigService
  ) {
  }

  async streamVideo(videoName: string): Promise<string> {
    const filePath = path.resolve(__dirname, '..', '..', 'src', 'storage', 'uploads');
    return path.resolve(filePath, videoName)
  }

  async createFiles(newsId: number, images: File[], videos: File[]): Promise<void> {
    const {imagesArray, videosArray} = await FilesService.saveFiles(images, videos)
    await this.filesModel.create({newsId, images: imagesArray, videos: videosArray, createdAt: Date.now()})
  }

  async getFilesUrls(newsId: number): Promise<IGetFilesByNewsIdResponseContract> {
    const newsFiles = await this.filesModel.findOne({newsId}).select('-__v')
    const {imagesUrls, videosUrls} = this.generationUrls(newsFiles)
    return {imagesUrls, videosUrls}
  }

  async getFilesListByNewsIds(newsIdsList: number[]): Promise<IGetFilesByNewsIdsListResponseContract> {
    const newsFilesByIds = await this.filesModel.find({newsId: {"$in": newsIdsList}})
    if (!newsFilesByIds) return []
    let newsFilesList = []
    newsFilesByIds.forEach((newsFiles) => {
      const newsData = {}
      const {imagesUrls, videosUrls} = this.generationUrls(newsFiles)
      newsData['newsId'] = newsFiles.newsId
      newsData['images'] = imagesUrls
      newsData['videos'] = videosUrls
      newsFilesList.push(newsData)
    })
    return newsFilesList
  }

  async updateNewsFiles(newsId: number, images: File[], videos: File[]): Promise<{success: boolean, message: string}> {
    const newsFiles = await this.filesModel.findOne({newsId}).select('-__v')
    const {imagesArray, videosArray} = await FilesService.saveFiles(images, videos)
    if (newsFiles) {
      const updateSet = {
        images: images ? imagesArray : newsFiles.images,
        videos: videos ? videosArray : newsFiles.videos,
        createdAt: Date.now()
      }
      await this.filesModel.updateOne({newsId}, updateSet)
      if (images) {
        newsFiles.images.forEach((image) => FilesService.removeFile(image))
      }
      if (videos) {
        newsFiles.videos.forEach((video) => FilesService.removeFile(video))
      }
    } else await this.filesModel.create({
      newsId, images: imagesArray, videos: videosArray, createdAt: Date.now()
    })
    return {success: true, message: `Files for news with id ${newsId} has been updated!`}
  }

  async deleteFiles(newsId): Promise<void> {
    const newsImages = await this.filesModel.findOne({newsId}).select('-__v')
    if (newsImages) {
      await this.filesModel.deleteOne({newsId})
      newsImages.images.forEach((image) => FilesService.removeFile(image))
      newsImages.videos.forEach((video) => FilesService.removeFile(video))
    }
  }


  private generationUrls(newsFiles): {imagesUrls: string[], videosUrls: string[]} {
    const imagesUrls = []
    const videosUrls = []
    newsFiles.images.forEach((image) => {
      image = `${this.configService.get<string>('SERVER_URL')}/files/${image}`
      imagesUrls.push(image)
    })
    newsFiles.videos.forEach((video) => {
      video = `${this.configService.get<string>('SERVER_URL')}/files/${video}`
      videosUrls.push(video)
    })
    return {imagesUrls, videosUrls}
  }

  private static async saveFiles(
    images: File[], videos: File[]
  ): Promise<{ imagesArray: string[], videosArray: string[] }> {
    const imagesArray: string[] = []
    const videosArray: string[] = []
    if (images) {
      for (const image of images) {
        const imagePath = await FilesService.createFile(image, FileTypeEnum.IMAGE)
        imagesArray.push(imagePath)
      }
    }
    if (videos) {
      for (const video of videos) {
        const videoPath = await FilesService.createFile(video, FileTypeEnum.VIDEO)
        videosArray.push(videoPath)
      }
    }
    return {imagesArray, videosArray}
  }

  private static async createFile(file: File, fileType: FileTypeEnum): Promise<string> {
    try {
      let buffer = Buffer.from(file.buffer)
      let fileName = ''
      if (fileType === FileTypeEnum.IMAGE) {
        buffer = await this.editImage(buffer)
        const metadata = await sharp(buffer).metadata()
        fileName = 'image-' + shortId.generate() + '.' + metadata.format;
      } else if (fileType === FileTypeEnum.VIDEO) {
        const fileExtension = file.originalname.split('.').pop()
        fileName = 'video-' + shortId.generate() + '.' + fileExtension;
      }
      const filePath = path.resolve(__dirname, '..', '..', 'src', 'storage', 'uploads');
      const fullPath = path.resolve(filePath, fileName)
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, {recursive: true});
      }
      fs.writeFileSync(fullPath, buffer);
      return fileName
    } catch (err) {
      throw new RpcException(new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  private static removeFile(filePath: string): void {
    const fullFilePath = path.resolve(__dirname, '..', '..', 'src', 'storage', 'uploads', filePath);
    try {
      fs.unlinkSync(fullFilePath);
    } catch (err) {
      console.log(`File with path ${fullFilePath} was not found!`)
    }
  }

  private static async editImage(imageBuffer: Buffer): Promise<Buffer> {
    const imageWidth = 1024
    const imageHeight = 1024

    // Уменьшение изображения до нужного размера с сохранением пропорций и преобразование формата
    return await sharp(imageBuffer)
      .resize({width: imageWidth, height: imageHeight, fit: 'inside', withoutEnlargement: true})
      .jpeg({quality: 100})
      .toBuffer()
  }
}
