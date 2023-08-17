export interface IGetFilesByNewsIdsListResponseContract extends Array<IGetNewsImages>{}

interface IGetNewsImages {
  newsId: number
  images: string[]
  videos: string[]
}
