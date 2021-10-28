import slides from './slides'
import { WebSocketServer } from 'ws'
import { createServer } from 'http'
import examples from './examples'

const handlers: { [route: string]: WebSocketServer } = {
  '/slides': slides,
  '/examples': examples
}

const server = createServer()

server.on('upgrade', (request, socket, head) => {
  const h = handlers[request.url]
  if (!h) {
    socket.destroy()
    return
  }

  h.handleUpgrade(request, socket as any, head, (ws) => {
    h.emit('connection', ws, request)
  })
})

server.listen(9001)
