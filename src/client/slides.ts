import { RemoteFile } from '../shared'

const renderMd = ({ content }: RemoteFile): HTMLElement => {
  const textArea = document.createElement('textarea')
  textArea.setAttribute('data-template', '')
  textArea.innerHTML = content

  const section = document.createElement('section')
  section.setAttribute('data-markdown', '')
  section.setAttribute('data-separator-notes', '^NOTES$')
  section.appendChild(textArea)

  return section
}

const renderHTML = ({ content }: RemoteFile): HTMLElement => {
  const section = document.createElement('section')
  section.innerHTML = content

  return section
}

const renderPNG = ({ content }: RemoteFile): HTMLElement => {
  const img = document.createElement('img')

  img.src = `data:image/png;base64,${content}`

  const section = document.createElement('section')
  section.replaceChildren(img)
  section.className = 'full-image'

  return section
}

const renderFuncs: { [type: string]: (slide: RemoteFile) => HTMLElement } = {
  md: renderMd,
  html: renderHTML,
  png: renderPNG
}

const renderSlide = (slide: RemoteFile): HTMLElement => {
  return renderFuncs[slide.type](slide)
}

export default renderSlide
