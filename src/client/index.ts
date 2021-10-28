import Reveal from 'reveal.js'
import Markdown from 'reveal.js/plugin/markdown/markdown.esm.js'
import Notes from 'reveal.js/plugin/notes/notes.esm.js'
import { RemoteFile } from '../shared'
import renderSlide from './slides'
import Prism from 'prismjs'
import PrismPlugin from './prismPlugin'
import MonacoPlugin from './monacoPlugin'

import './index.css'

const persistentState: {
  indexv: number
  indexh: number
  showNotes: boolean
} = {
  indexv: 0,
  indexh: 0,
  showNotes: false
}

let reveal: Reveal

const render = (slides: Array<RemoteFile>) => {
  const slidesDiv = document.createElement('div')
  slidesDiv.className = 'slides'
  const revealDiv = document.createElement('div')
  revealDiv.className = 'reveal'
  revealDiv.appendChild(slidesDiv)

  slides.forEach((slide) => {
    slidesDiv.appendChild(renderSlide(slide))
  })

  document.querySelector('body #render-reveal-here').replaceChildren(revealDiv)

  reveal = new Reveal({
    plugins: [Markdown, Notes, PrismPlugin, MonacoPlugin],
    showNotes: persistentState.showNotes,
    disableLayout: true
  })
  reveal.addEventListener('slidechanged', ({ indexh, indexv }) => {
    persistentState.indexh = indexh
    persistentState.indexv = indexv

    const openEditor = document.querySelector(
      '.reveal .present [data-open-editor]'
    )
    if (!openEditor) {
      return
    }
    const handlerIndex = /^handlers-(\d)+\.ts$/.exec(
      openEditor.getAttribute('data-open-editor')
    )[1]
    fetch(`http://localhost:7000/switch+${handlerIndex}`)
      .then(() => console.log('switched to handler', handlerIndex))
      .catch(console.log)
  })
  reveal
    .initialize({
      transition: 'none'
    })
    .then(() => {
      new Array(persistentState.indexh).fill(0).forEach(reveal.right)
      new Array(persistentState.indexv).fill(0).forEach(reveal.down)
      reveal.configure({
        transition: 'slide'
      })

      Prism.highlightAll()
    })
}

document.addEventListener('DOMContentLoaded', () => {
  const slidesWS = new WebSocket('ws://localhost:9001/slides')

  slidesWS.onmessage = (message) => {
    const slides = JSON.parse(message.data) as Array<RemoteFile>
    render(slides)
  }

  runExampleClient()
})

document.addEventListener('keyup', ({ key, target }) => {
  if (key === 'q' && reveal) {
    reveal.configure({
      showNotes: (persistentState.showNotes = !persistentState.showNotes)
    })
  }
  if (key === 'c') {
    const c = document.getElementById('example-client')
    c.style.display = c.style.display === 'none' ? 'flex' : 'none'
  }
})

const runExampleClient = () => {
  const resetFields = () => {
    Array.from(document.querySelectorAll('#example-client-form input')).forEach(
      (element) => {
        ;(element as HTMLInputElement).value = ''
      }
    )
  }
  const renderRequest = (request: string) => {
    ;(
      document.querySelector('#example-client-request code') as HTMLElement
    ).textContent = request
  }
  const renderResult = (result: string) => {
    ;(
      document.querySelector('#example-client-result code') as HTMLElement
    ).textContent = result
    resetFields()
  }

  document.getElementById('example-client-get').onclick = () => {
    const username = (
      document.getElementById('example-client-username') as HTMLInputElement
    ).value
    const filename = (
      document.getElementById('example-client-filename') as HTMLInputElement
    ).value

    renderRequest(`fetch('http://localhost:7000/${filename}', {
      method: 'GET',
      headers: {
        authorization: '${username}'
      }
    })`)

    Prism.highlightAll()

    fetch(`http://localhost:7000/${filename}`, {
      method: 'GET',
      headers: {
        authorization: username
      }
    })
      .then((resp) => resp.text())
      .then(renderResult)
  }
  document.getElementById('example-client-post').onclick = () => {
    const username = (
      document.getElementById('example-client-username') as HTMLInputElement
    ).value
    const filename = (
      document.getElementById('example-client-filename') as HTMLInputElement
    ).value
    const content = (
      document.getElementById('example-client-content') as HTMLInputElement
    ).value

    renderRequest(`fetch('http://localhost:7000/${filename}', {
      method: 'POST',
      headers: {
        authorization: '${username}'
      },
      body: content
    })`)

    Prism.highlightAll()

    fetch(`http://localhost:7000/${filename}`, {
      method: 'POST',
      headers: {
        authorization: username
      },
      body: content
    })
      .then((resp) => resp.text())
      .then(renderResult)
  }
}
