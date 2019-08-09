import { xslText } from './web-screenshot-xsl'
import { parseXmlText, xslt, isSlowNetwork, getOrigin, isAllowedOrigin } from './utils'
interface Window { WebScreenshot }
declare var window: Window

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
        const allowOrigin = this.getAttribute('allow-origin')
        if (allowOrigin) {
          const srcOrigin = getOrigin(newVal)
          if (!isAllowedOrigin(srcOrigin, allowOrigin)) {
            throw new Error(`Origin ${srcOrigin} is not allowed by attribute "allow-origin"`)
          }
        }
        const xmlRes = await fetch(newVal, { mode: 'cors' })
        const xml = parseXmlText(await xmlRes.text())
        const xsl = parseXmlText(xslText)
        // XXX: Experimental
        if (isSlowNetwork()) {
          xml.querySelector('external-images').remove()
        }
        const svgDoc = xslt(xml, xsl)
        const svgElem = <SVGElement>svgDoc.firstChild
        if (svgElem.nodeName.toLowerCase() !== 'svg') {
          throw new Error('Unknown xml document')
        }
        this.removeOlder()
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
