import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {HydratedDocument, now} from 'mongoose';
import {LogTypeEnum} from "./enums/log-type.enum";
import {MicroservicesEnum} from "./enums/microservices.enum";

export type LoggerDocument = HydratedDocument<LoggerModel>;

@Schema({timestamps: true})
export class LoggerModel {

  @Prop({required: true, enum: LogTypeEnum, default: 'Action'})
  type: string

  @Prop({required: true, enum: MicroservicesEnum, default: 'Other'})
  microservice: string

  @Prop({required: true})
  message: string

  @Prop({default: ''})
  additionalInfo: string

  @Prop({required: true, default: now()})
  createdAt: Date
}

export const LoggerModelSchema = SchemaFactory.createForClass(LoggerModel);