import { xslText } from './web-screenshot-xsl'
interface Window { WebScreenshot }
declare var window: Window

const parseXmlText = (xmlText: string): Document => {
  const parser = new DOMParser()
  return parser.parseFromString(xmlText, 'application/xml')
}

const xslt = (source: Document, xsl: Document): DocumentFragment => {
  const xsltProcessor = new XSLTProcessor()
  xsltProcessor.importStylesheet(xsl)
  return xsltProcessor.transformToFragment(source, document)
}

export default class WebScreenshot extends HTMLElement {
  constructor() {
    super()
    this.render()
  }

  static get is (): string {
    return 'web-screenshot'
  }

  static get observedAttributes () {
    return ['src', ...WebScreenshot.sizeAttributes]
  }

  static get sizeAttributes () {
    return ['width', 'height', 'max-width', 'max-height']
  }

  get root(): ShadowRoot | null {
    // @ts-ignore
    return this._root
  }

  setInitialSize(svgElem: SVGElement) {
    svgElem.style.width = 'auto'
    svgElem.style.height = 'auto'
    for (const attr of WebScreenshot.sizeAttributes) {
      let val = this.getAttribute(attr)
      if (val === null || val.length === 0) continue
      if (!val.endsWith('px')) val = `${val}px`
      svgElem.style[attr] = val
    }
  }

  removeOlder() {
    this.root.innerHTML = ''
  }

  async attributeChangedCallback(attr, oldVal, newVal) {
    if (oldVal === newVal) return
    switch (attr) {
      case 'src': {
        if (!newVal) break
        const xmlRes = await fetch(newVal, { mode: 'cors' })
        const xml = parseXmlText(await xmlRes.text())
        const xsl = parseXmlText(xslText)
        const svgDoc = xslt(xml, xsl)

        this.removeOlder()
        this.setInitialSize(<SVGElement>svgDoc.firstChild)
        this.root.appendChild(svgDoc)
        break
      }
      case 'width':
      case 'height':
      case 'max-width':
      case 'max-height': {
        const svgElem = this.root && <HTMLElement>this.root.firstChild
        if (!svgElem) break
        if (!newVal) {
          const isWidthOrHeight = (attr === 'width' || attr === 'height')
          svgElem.style[attr] = isWidthOrHeight ? 'auto' : 'unset'
          break
        }
        if (!newVal.endsWith('px')) newVal = `${newVal}px`
        svgElem.style[attr] = newVal
      }
    }
  }

  render() {
    // @ts-ignore
    this._root = this.attachShadow({ mode: 'open' })
  }
}

window.WebScreenshot = WebScreenshot

