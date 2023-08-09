import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {FilesModel, FilesModelSchema} from "./models/files.model";

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: FilesModel.name, schema: FilesModelSchema}
    ])
  ],
  controllers: [FilesController],
  providers: [FilesService]
})
export class FilesModule {}
