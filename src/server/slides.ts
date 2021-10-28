import fs from 'fs'
import { extname } from 'path'
import { RemoteFile } from '../shared'
import walkdir from 'walkdir'
import { WebSocket, WebSocketServer } from 'ws'

const getSlides = (): string => {
  let slides: Array<RemoteFile> = []
  walkdir.sync('./slides', (path) => {
    const ext = extname(path).substr(1)
    if (ext === 'md' || ext === 'html') {
      slides = [
        ...slides,
        {
          content: fs.readFileSync(path, { encoding: 'utf-8' }),
          type: ext,
          name: path
        }
      ]
    }
    if (ext === 'png') {
      slides = [
        ...slides,
        {
          content: fs.readFileSync(path, { encoding: 'base64' }),
          type: ext,
          name: path
        }
      ]
    }
  })
  return JSON.stringify(slides)
}

const wss = new WebSocketServer({ noServer: true })

wss.on('connection', (ws: WebSocket) => {
  ws.send(getSlides())

  let lastSend = ''
  fs.watch('./slides', () => {
    const current = getSlides()
    if (lastSend !== current) {
      ws.send(current)
      lastSend = current
    }
  })
})

export default wss
