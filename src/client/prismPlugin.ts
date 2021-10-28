import Prism from 'prismjs'
import { Plugin, RevealStatic } from 'reveal.js'

const Plugin: Plugin = {
  id: 'prism',
  init: (reveal: RevealStatic): void | Promise<any> => {
    Array.from(reveal.getRevealElement().querySelectorAll('pre code')).forEach(
      (block) => {
        block.className = `language-${block.className}`
      }
    )
  }
}

export default Plugin

// keto relation tuple syntax highlighting
const delimiter = {
  delimiter: /[:#@()]/
}

const namespace = {
  pattern: /[^:#@()\n]+:/,
  inside: {
    ...delimiter,
    namespace: /.*/
  }
}

const object = {
  pattern: /[^:#@()\n]+#/,
  inside: {
    ...delimiter,
    'property-access': /.*/
  }
}

const relation = {
  pattern: /[^:#@()\n]+/
}

const subjectID = {
  pattern: /@[^:#@()\n]+/,
  inside: {
    ...delimiter,
    subject: /.*/
  }
}

const subjectSet = {
  pattern: /@\(([^:#@()\n]+:)?([^:#@()\n]+)#([^:#@()\n]*)\)/,
  inside: {
    delimiter: /[@()]*/,
    namespace,
    object,
    relation
  }
}

Prism.languages['keto-relation-tuples'] = {
  comment: /\/\/.*(\n|$)/,
  'relation-tuple': {
    pattern:
      /([^:#@()\n]+:)?([^:#@()\n]+)#([^:#@()\n]+)@?((\(([^:#@()\n]+:)?([^:#@()\n]+)#([^:#@()\n]*)\))|([^:#@()\n]+))/,
    inside: {
      namespace,
      object,
      subjectID,
      subjectSet,
      relation
    }
  }
}
