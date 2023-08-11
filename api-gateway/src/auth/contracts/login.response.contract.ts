export interface ILoginResponseContract {
  user: IUserResponse
  accessToken: string
}

interface IUserResponse {
  id: number
  username: string
  email: string
  role: string
}