import * as monaco from 'monaco-editor'

// @ts-ignore
self.MonacoEnvironment = {
  getWorkerUrl: (moduleId: string, label: string) => {
    if (label === 'json') {
      return './json.worker.bundle.js'
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return './css.worker.bundle.js'
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return './html.worker.bundle.js'
    }
    if (label === 'typescript' || label === 'javascript') {
      return './ts.worker.bundle.js'
    }
    return './editor.worker.bundle.js'
  }
}

// compiler options
monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
  module: monaco.languages.typescript.ModuleKind.CommonJS
})

self.addEventListener('DOMContentLoaded', () => {
  // @ts-ignore
  const {
    editorContent: content,
    editorType: type,
    editorDiffContent: diffContent
  }: {
    editorContent: string
    editorType: string
    editorDiffContent?: string
  } = window
  if (!content || !type) {
    console.log('got unexpected data', content, type)
    return
  }

  const language = type === 'ts' ? 'typescript' : type

  if (!diffContent) {
    const editor = monaco.editor.create(document.getElementById('container'), {
      value: content,
      language
    })
    self.onresize = () => editor.layout()
  } else {
    const editor = monaco.editor.createDiffEditor(
      document.getElementById('container')
    )
    editor.setModel({
      original: monaco.editor.createModel(diffContent, language),
      modified: monaco.editor.createModel(content, language)
    })

    self.onresize = () => editor.layout()
  }
})
