import {ConfigService} from "@nestjs/config";
import {MongooseModuleOptions} from "@nestjs/mongoose";

export const getMongoConfig = async (configService: ConfigService): Promise<MongooseModuleOptions> => ({
  uri: `mongodb://${configService.get('MONGO_HOST')}/${configService.get('MONGO_DATABASE')}`
})