import { handleGet as get0, handlePost as post0 } from './handlers-0'
import { handleGet as get1, handlePost as post1 } from './handlers-1'
import { handleGet as get2, handlePost as post2 } from './handlers-2'
import { handleGet as get3, handlePost as post3 } from './handlers-3'
import { IncomingMessage, ServerResponse } from 'http'

const handlers = {
  GET: [get0, get1, get2, get3],
  POST: [post0, post1, post2, post3]
}

let current = 0

export const handleGet = (
  req: IncomingMessage,
  res: ServerResponse,
  filePath: string
) => {
  if (req.url.startsWith('/switch')) {
    current = parseInt(req.url.split('+')[1])
    res.statusCode = 200
    res.end('set current ' + current)
    return
  }

  handlers.GET[current](req, res, filePath)
}

export const handlePost = (
  req: IncomingMessage,
  res: ServerResponse,
  filePath: string
) => {
  handlers.POST[current](req, res, filePath)
}
