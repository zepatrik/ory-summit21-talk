import { Plugin, RevealStatic } from 'reveal.js'
import { RemoteFile } from '../shared'

let examples: Array<RemoteFile> = []

document.addEventListener('DOMContentLoaded', () => {
  const exampleWS = new WebSocket('ws://localhost:9001/examples')

  exampleWS.onmessage = (message) => {
    examples = JSON.parse(message.data) as Array<RemoteFile>
    renderEditors()
  }
})

const renderEditors = () => {
  Array.from<HTMLElement>(
    document.querySelectorAll('[data-open-editor]')
  ).forEach((container) => {
    renderEditor(
      container,
      container.getAttribute('data-open-editor'),
      container.hasAttribute('data-open-editor-diff')
        ? container.getAttribute('data-open-editor-diff')
        : undefined
    )
  })
}

const renderEditor = (
  container: HTMLElement,
  fileName: string,
  diffName?: string
) => {
  const { content = 'not found', type = 'txt' } =
    examples.find(({ name }) => name === fileName) || {}

  const { content: diffContent } =
    examples.find(({ name }) => name === diffName) || {}

  const frame = document.createElement('iframe')
  frame.src = 'editor.html'

  container.replaceChildren(frame)

  // @ts-ignore
  frame.contentWindow.editorContent = content
  // @ts-ignore
  frame.contentWindow.editorType = type
  // @ts-ignore
  frame.contentWindow.editorDiffContent = diffContent
}

const Plugin: Plugin = {
  id: 'monaco',
  init: renderEditors
}

export default Plugin
