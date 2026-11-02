// Aisa error jis ke saath status code (404, 409 waghera) jata hai
export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}