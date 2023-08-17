import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {HydratedDocument, now} from 'mongoose';

export type FilesDocument = HydratedDocument<FilesModel>;

@Schema({timestamps: true})
export class FilesModel {

  @Prop({required: true})
  newsId: number

  @Prop({default: []})
  images: string[]

  @Prop({default: []})
  videos: string[]

  @Prop({required: true, default: Date.now})
  createdAt: Date
}

export const FilesModelSchema = SchemaFactory.createForClass(FilesModel);