import fs from 'fs/promises'
import { IncomingMessage, ServerResponse } from 'http'

import * as grpc from '@grpc/grpc-js'
import {
  acl,
  write,
  writeService,
  check,
  checkService
} from '@ory/keto-grpc-client/ory/keto/acl/v1alpha1'

const checkClient = new checkService.CheckServiceClient(
  '127.0.0.1:4466',
  grpc.credentials.createInsecure()
)

const checkIsOwner = (filePath: string, username: string) => {
  const checkRequest = new check.CheckRequest()
  checkRequest.setNamespace('files')
  checkRequest.setObject(filePath)
  checkRequest.setRelation('owner')

  const sub = new acl.Subject()
  sub.setId(username)
  checkRequest.setSubject(sub)

  return new Promise<boolean>((resolve, reject) => {
    checkClient.check(checkRequest, (error, resp) => {
      if (error) {
        reject(error)
      } else {
        resolve(resp.getAllowed())
      }
    })
  })
}

export const handleGet = async (
  req: IncomingMessage,
  res: ServerResponse,
  filePath: string
) => {
  // assuming this can only be set by ingress/upstream service/...
  const username = req.headers.authorization
  if (!username) {
    res.statusCode = 403
    res.end('Only for authenticated users.')
    return
  }

  if (!(await checkIsOwner(filePath, username))) {
    res.statusCode = 403
    res.end('You are not the owner of the file')
    return
  }

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

const writeClient = new writeService.WriteServiceClient(
  '127.0.0.1:4467',
  grpc.credentials.createInsecure()
)

const addOwnershipRelation = (filePath: string, username: string) => {
  const relationTuple = new acl.RelationTuple()
  relationTuple.setNamespace('files')
  relationTuple.setObject(filePath)
  relationTuple.setRelation('owner')

  const sub = new acl.Subject()
  sub.setId(username)
  relationTuple.setSubject(sub)

  const tupleDelta = new write.RelationTupleDelta()
  tupleDelta.setAction(write.RelationTupleDelta.Action.INSERT)
  tupleDelta.setRelationTuple(relationTuple)

  const writeRequest = new write.TransactRelationTuplesRequest()
  writeRequest.addRelationTupleDeltas(tupleDelta)

  return new Promise<void>((resolve, reject) => {
    writeClient.transactRelationTuples(writeRequest, (error) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}

export const handlePost = async (
  req: IncomingMessage,
  res: ServerResponse,
  filePath: string
) => {
  // assuming this can only be set by ingress/upstream service/...
  const username = req.headers.authorization
  if (!username) {
    res.statusCode = 403
    res.end('Only for authenticated users.')
    return
  }

  await addOwnershipRelation(filePath, username)

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
