const fs = require('fs')
const requestPromise = require('request-promise')

const main = async xslUrl => {
  if (!xslUrl) {
    throw new Error('xslUrl is required')
  }
  let xslText = await requestPromise.get(xslUrl)
  const xslLines = xslText.split('\n')
  xslText = [
    '/* Run `npm run fetch-xsl` to generate this file */',
    `export const xslText = \`${xslLines.shift()}\n${xslLines.map(line => line.trim()).join('')}\``
  ].join('\n')
  writeJs(xslText)
}

const writeJs = xslText => {
  const filePath = './src/web-screenshot-xsl.ts'
  fs.writeFileSync(filePath, xslText)
}

// https://github.com/daiiz/ScreenshotML/blob/master/web-screenshot.xsl
main('https://raw.githubusercontent.com/daiiz/ScreenshotML/master/web-screenshot.xsl')
