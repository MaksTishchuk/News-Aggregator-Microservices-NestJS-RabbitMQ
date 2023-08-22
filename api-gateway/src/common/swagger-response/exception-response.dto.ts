export class ExceptionResponseDto {
  timestamp: Date
  path: string
  error: {
    message: string
    name: string
    status: number
  }
}