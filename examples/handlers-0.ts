import fs from 'fs/promises'
import { IncomingMessage, ServerResponse } from 'http'

export const handleGet = async (
  req: IncomingMessage,
  res: ServerResponse,
  filePath: string
) => {
  return fs
    .readFile(filePath)
    .then((data) => {
      res.setHeader('Content-type', 'text/plain')
      res.end(data)
    })
    .catch((err) => {
      res.statusCode = 500
      res.end(`File ${req.url} cannot be served: ${err}`)
    })
}

export const handlePost = async (
  req: IncomingMessage,
  res: ServerResponse,
  filePath: string
) => {
  return fs
    .open(filePath, 'w', 0o600)
    .then(async (file) => {
      let body = ''
      for await (const chunk of req) {
        if (chunk instanceof Buffer) {
          body += chunk.toString('utf-8')
        }
      }

      return file
        .write(body)
        .then(() => {
          res.statusCode = 201
          res.setHeader('Location', req.url)
          res.end('Success')
        })
        .finally(file.close)
    })
    .catch((err) => {
      res.statusCode = 500
      res.end(`File ${req.url} cannot be written: ${err}`)
    })
}
