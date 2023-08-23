import {NewsEntityWithAuthorFilesDto} from "./news-entity-with-author-files.dto";
import {SearchNewsInterface} from "../interfaces/search-news.interface";

export class SearchNewsSwaggerDto implements SearchNewsInterface {
  news: NewsEntityWithAuthorFilesDto[]
  total: number
}
