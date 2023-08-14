export interface IGetImagesByNewsIdsListResponseContract extends Array<IGetNewsImages>{}

interface IGetNewsImages {
  newsId: number
  images: string[]
}
