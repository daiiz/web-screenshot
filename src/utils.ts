interface Navigator { connection }
declare var navigator: Navigator

export const parseXmlText = (xmlText: string): Document => {
  const parser = new DOMParser()
  return parser.parseFromString(xmlText, 'application/xml')
}

export const xslt = (source: Document, xsl: Document): DocumentFragment => {
  const xsltProcessor = new XSLTProcessor()
  xsltProcessor.importStylesheet(xsl)
  return xsltProcessor.transformToFragment(source, document)
}

export const isSlowNetwork = (): boolean => {
  const connectionInfo = navigator.connection
  if (!connectionInfo) return false
  if (connectionInfo.effectiveType !== '4g') {
    console.warn('Network is slow')
    return true
  }
  return false
}

export const getOrigin = (url: string): string => {
  try {
    return new URL(url).origin
  } catch (err) {
    throw err
  }
}

export const isAllowedOrigin = (srcOrigin: string, allowOrigin: string): boolean => {
  if (!allowOrigin || allowOrigin === '*') return true
  allowOrigin = allowOrigin.replace(/\/$/, '')
  return srcOrigin === allowOrigin
}
