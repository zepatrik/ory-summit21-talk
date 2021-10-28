import http from 'http'
import path from 'path'
import { handleGet, handlePost } from './handlers'

const baseDir = process.argv[2] || 'data'
const port = parseInt(process.argv[3]) || 7000

http
  .createServer((req, res) => {
    console.log(`${req.method} ${req.url}`)

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Request-Method', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST')
    res.setHeader('Access-Control-Allow-Headers', '*')

    if (req.url.indexOf('..') >= 0) {
      res.statusCode = 403
      res.end('Path escape not allowed.')
      return
    }

    const filePath = path.join(baseDir, req.url)

    switch (req.method) {
      case 'OPTIONS':
        res.statusCode = 200
        res.end()
        return
      case 'GET':
        return handleGet(req, res, filePath)
      case 'POST':
        return handlePost(req, res, filePath)
      default:
        res.statusCode = 401
        res.end(`Unknown method ${req.method}, expected GET or POST`)
        return
    }
  })
  .listen(port)

console.log(`Server listening on port ${port}`)
