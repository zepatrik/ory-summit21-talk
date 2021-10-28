import fs from 'fs'
import { extname, basename } from 'path'
import { RemoteFile } from '../shared'
import walkdir from 'walkdir'
import { WebSocket, WebSocketServer } from 'ws'

const pattern = /(handlers-\d+\.ts$)|server\.ts/

const getExamples = (): string => {
  let examples: Array<RemoteFile> = []
  walkdir.sync('./examples', (path) => {
    if (!pattern.test(path)) {
      return
    }

    const ext = extname(path).substr(1)

    examples = [
      ...examples,
      {
        content: fs.readFileSync(path, { encoding: 'utf-8' }),
        type: ext,
        name: basename(path)
      }
    ]
  })
  return JSON.stringify(examples)
}

const wss = new WebSocketServer({ noServer: true })

wss.on('connection', (ws: WebSocket) => {
  ws.send(getExamples())

  let lastSend = ''
  fs.watch('./examples', () => {
    const current = getExamples()
    if (lastSend !== current) {
      ws.send(current)
      lastSend = current
    }
  })
})

export default wss
