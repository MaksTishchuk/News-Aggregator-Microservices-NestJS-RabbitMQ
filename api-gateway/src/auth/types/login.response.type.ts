export type LoginResponseType = {
  user: UserResponse
  accessToken: string
}

export type UserResponse = {
  id: number
  username: string
  email: string
  role: string
}