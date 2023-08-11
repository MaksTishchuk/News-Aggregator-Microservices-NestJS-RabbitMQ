export interface ILoginResponseContract {
  user: IUserResponse
  accessToken: string
}

export interface IUserResponse {
  id: number
  username: string
  email: string
  role: string
}