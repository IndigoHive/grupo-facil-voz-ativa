export interface IResult<T> {
  data?: T
  isError: boolean
  errorMessage?: any
  statusCode?: number
}
