(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const web_screenshot_xsl_1 = require("./web-screenshot-xsl");
const utils_1 = require("./utils");
class WebScreenshot extends HTMLElement {
    constructor() {
        super();
        this.render();
    }
    static get is() {
        return 'web-screenshot';
    }
    static get observedAttributes() {
        return ['src', ...WebScreenshot.sizeAttributes];
    }
    static get sizeAttributes() {
        return ['width', 'height', 'max-width', 'max-height'];
    }
    get root() {
        // @ts-ignore
        return this._root;
    }
    setInitialSize(svgElem) {
        svgElem.style.width = 'auto';
        svgElem.style.height = 'auto';
        for (const attr of WebScreenshot.sizeAttributes) {
            let val = this.getAttribute(attr);
            if (val === null || val.length === 0)
                continue;
            if (!val.endsWith('px'))
                val = `${val}px`;
            svgElem.style[attr] = val;
        }
    }
    removeOlder() {
        this.root.innerHTML = '';
    }
    attributeChangedCallback(attr, oldVal, newVal) {
        return __awaiter(this, void 0, void 0, function* () {
            if (oldVal === newVal)
                return;
            switch (attr) {
                case 'src': {
                    if (!newVal)
                        break;
                    const srcOrigin = utils_1.getOrigin(newVal);
                    if (!utils_1.isAllowedOrigin(srcOrigin, this.getAttribute('allow-origin'))) {
                        throw new Error(`Origin ${srcOrigin} is not allowed by attribute "allow-origin"`);
                    }
                    const xmlRes = yield fetch(newVal, { mode: 'cors' });
                    const xml = utils_1.parseXmlText(yield xmlRes.text());
                    const xsl = utils_1.parseXmlText(web_screenshot_xsl_1.xslText);
                    // XXX: Experimental
                    if (utils_1.isSlowNetwork()) {
                        xml.querySelector('external-images').remove();
                    }
                    const svgDoc = utils_1.xslt(xml, xsl);
                    const svgElem = svgDoc.firstChild;
                    if (svgElem.nodeName.toLowerCase() !== 'svg') {
                        throw new Error('Unknown xml document');
                    }
                    this.removeOlder();
                    this.setInitialSize(svgElem);
                    this.root.appendChild(svgDoc);
                    break;
                }
                case 'width':
                case 'height':
                case 'max-width':
                case 'max-height': {
                    const svgElem = this.root && this.root.firstChild;
                    if (!svgElem)
                        break;
                    if (!newVal) {
                        const isWidthOrHeight = (attr === 'width' || attr === 'height');
                        svgElem.style[attr] = isWidthOrHeight ? 'auto' : 'unset';
                        break;
                    }
                    if (!newVal.endsWith('px'))
                        newVal = `${newVal}px`;
                    svgElem.style[attr] = newVal;
                }
            }
        });
    }
    render() {
        // @ts-ignore
        this._root = this.attachShadow({ mode: 'open' });
    }
}
exports.default = WebScreenshot;
window.WebScreenshot = WebScreenshot;

},{"./utils":2,"./web-screenshot-xsl":3}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseXmlText = (xmlText) => {
    const parser = new DOMParser();
    return parser.parseFromString(xmlText, 'application/xml');
};
exports.xslt = (source, xsl) => {
    const xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(xsl);
    return xsltProcessor.transformToFragment(source, document);
};
exports.isSlowNetwork = () => {
    const connectionInfo = navigator.connection;
    if (!connectionInfo)
        return false;
    if (connectionInfo.effectiveType !== '4g') {
        console.warn('Network is slow');
        return true;
    }
    return false;
};
exports.getOrigin = (url) => {
    try {
        return new URL(url).origin;
    }
    catch (err) {
        throw err;
    }
};
exports.isAllowedOrigin = (srcOrigin, allowOrigin) => {
    if (!allowOrigin || allowOrigin === '*')
        return true;
    allowOrigin = allowOrigin.replace(/\/$/, '');
    return srcOrigin === allowOrigin;
};

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* Run `npm run fetch-xsl` to generate this file */
exports.xslText = `<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"><xsl:template match="web-screenshot"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><xsl:attribute name='width'><xsl:value-of select="natural-width" /></xsl:attribute><xsl:attribute name='height'><xsl:value-of select="natural-height" /></xsl:attribute><xsl:attribute name='viewBox'><xsl:text>0</xsl:text><xsl:text> </xsl:text><xsl:text>0</xsl:text><xsl:text> </xsl:text><xsl:value-of select="natural-width" /><xsl:text> </xsl:text><xsl:value-of select="natural-height" /></xsl:attribute><defs><style type="text/css"><![CDATA[.source text {fill: #888888;font-size: 11px;font-weight: 400;text-decoration: none;font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;}.source text:hover {text-decoration: underline;fill: #2962FF;}]]></style></defs><image xmlns:xlink="http://www.w3.org/1999/xlink"><xsl:attribute name='x'><xsl:text>0</xsl:text></xsl:attribute><xsl:attribute name='y'><xsl:text>0</xsl:text></xsl:attribute><xsl:attribute name='width'><xsl:value-of select="natural-width" /></xsl:attribute><xsl:attribute name='height'><xsl:value-of select="natural-height" /></xsl:attribute><xsl:attribute name='xlink:href'><xsl:value-of select="background-image/@src" /></xsl:attribute></image><a xmlns:xlink="http://www.w3.org/1999/xlink" class="source" target="_blank" style="cursor: pointer;"><xsl:attribute name='xlink:href'><xsl:value-of select="cite/@source" /></xsl:attribute><text fill="transparent"><xsl:attribute name='x'><xsl:value-of select="4" /></xsl:attribute><xsl:attribute name='y'><xsl:value-of select="natural-height - 4" /></xsl:attribute><xsl:value-of select="cite" /></text></a><xsl:for-each select="external-images/image"><image xmlns:xlink="http://www.w3.org/1999/xlink"><xsl:attribute name='xlink:href'><xsl:value-of select="@href" /></xsl:attribute><xsl:attribute name='x'><xsl:value-of select="@x" /></xsl:attribute><xsl:attribute name='y'><xsl:value-of select="@y" /></xsl:attribute><xsl:attribute name='width'><xsl:value-of select="@width" /></xsl:attribute><xsl:attribute name='height'><xsl:value-of select="@height" /></xsl:attribute></image></xsl:for-each><xsl:for-each select="external-links/link"><a xmlns:xlink="http://www.w3.org/1999/xlink" target="_blank" style="cursor: pointer;"><xsl:attribute name='xlink:href'><xsl:value-of select="@href" /></xsl:attribute><rect fill="transparent"><xsl:attribute name='x'><xsl:value-of select="@x" /></xsl:attribute><xsl:attribute name='y'><xsl:value-of select="@y" /></xsl:attribute><xsl:attribute name='width'><xsl:value-of select="@width" /></xsl:attribute><xsl:attribute name='height'><xsl:value-of select="@height" /></xsl:attribute></rect><text fill="transparent"><xsl:attribute name='x'><xsl:value-of select="@x" /></xsl:attribute><xsl:attribute name='y'><xsl:value-of select="@y+@height" /></xsl:attribute><xsl:value-of select="." /></text></a></xsl:for-each></svg></xsl:template></xsl:stylesheet>`;

},{}]},{},[1]);
