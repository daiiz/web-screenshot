import { xslText } from './web-screenshot-xsl'
interface Window { WebScreenshot }
declare var window: Window

export default class WebScreenshot extends HTMLElement {
  constructor() {
    super()
    this.render()
  }

  static get is () {
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

  setInitialSize(svgElem) {
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
        let parser
        const xmlRes = await fetch(newVal, { mode: 'cors' })
        parser = new DOMParser()
        const xml = parser.parseFromString(await xmlRes.text(), 'application/xml')
        parser = new DOMParser()
        const xsl = parser.parseFromString(xslText, 'application/xml')

        const xsltProcessor = new XSLTProcessor()
        xsltProcessor.importStylesheet(xsl)
        const svgDoc: DocumentFragment = xsltProcessor.transformToFragment(xml, document)

        this.removeOlder()
        const svgElem = <HTMLElement>svgDoc.firstChild
        svgElem.style.width = 'auto'
        svgElem.style.height = 'auto'
        this.setInitialSize(svgElem)
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

