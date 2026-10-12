'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const origin = 'https://www.onestepmy.com';
const read = file => fs.readFileSync(path.join(root, file), 'utf8').replace(/^\uFEFF/, '');
const esc = value => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
// Source notes contain formatting and occasional unmatched closing divs. Keep their
// words and line breaks without allowing markup to escape the generated container.
function plain(value) {
    return String(value ?? '').replace(/<br\s*\/?\s*>/gi, '\n').replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&#(?:39|x27);/g, "'").trim();
}
const rich = value => esc(plain(value)).replace(/\r?\n/g, '<br>');
const jsonScript = (value, id) => `<script type="application/ld+json"${id ? ` id="${id}"` : ''}>${JSON.stringify(value).replace(/</g, '\\u003c')}</script>`;
const urlFor = file => origin + '/' + (file === 'index.html' ? '' : file.replace(/\.html$/, ''));

// Replace a known element without regex truncation at its first nested closing tag.
function elementRange(html, opening) {
    const match = opening.exec(html);
    if (!match) return null;
    const tag = /^<(\w+)/.exec(match[0])[1];
    const tokens = new RegExp(`<\\/?${tag}\\b[^>]*>`, 'gi');
    tokens.lastIndex = match.index;
    let depth = 0, token;
    while ((token = tokens.exec(html))) {
        depth += token[0].startsWith('</') ? -1 : 1;
        if (!depth) return [match.index, tokens.lastIndex];
    }
    throw new Error(`Unclosed ${tag}: ${match[0]}`);
}
function replaceElement(html, opening, replacement, required = true) {
    const range = elementRange(html, opening);
    if (!range) {
        if (required) throw new Error(`Missing element ${opening}`);
        return html;
    }
    return html.slice(0, range[0]) + replacement + html.slice(range[1]);
}
function block(html, name, content, anchor = '</head>') {
    const start = `<!-- seo:${name}:start -->`, end = `<!-- seo:${name}:end -->`;
    const output = `${start}\n${content}\n${end}`;
    if (html.includes(start)) {
        const a = html.indexOf(start), b = html.indexOf(end, a);
        if (b < 0) throw new Error(`Missing end marker ${name}`);
        return html.slice(0, a) + output + html.slice(b + end.length);
    }
    if (!html.includes(anchor)) throw new Error(`Missing insertion point ${anchor}`);
    return html.replace(anchor, output + '\n' + anchor);
}
function metadata(html, file, title, description, schema = [], type = 'website') {
    const end = html.indexOf('</head>');
    let head = html.slice(0, end), rest = html.slice(end);
    head = head.replace(/<title\b[^>]*>[\s\S]*?<\/title>\s*/gi, '')
        .replace(/<meta\b[^>]*(?:name=["'](?:description|keywords)["']|property=["']og:(?:title|description|type|url)["'])[^>]*>\s*/gi, '')
        .replace(/<link\b[^>]*rel=["']canonical["'][^>]*>\s*/gi, '')
        .replace(/<!-- seo:metadata:start -->[\s\S]*?<!-- seo:metadata:end -->\s*/g, '')
        .replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi, '');
    const url = urlFor(file);
    return head.trimEnd() + '\n' + `<!-- seo:metadata:start -->
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${url}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="${type}">
  <meta property="og:url" content="${url}">
  ${jsonScript({'@context':'https://schema.org', '@graph':schema})}
<!-- seo:metadata:end -->\n` + rest;
}
function breadcrumbs(items) {
    return {'@type':'BreadcrumbList', itemListElement:items.map(([name, file], index) => ({'@type':'ListItem', position:index + 1, name, item:urlFor(file)}))};
}
function breadcrumbHtml(items) {
    return `<nav class="study-breadcrumb" aria-label="Breadcrumb">${items.map(([name,file]) => `<a href="${urlFor(file).replace(origin, '')}">${esc(name)}</a>`).join(' <span aria-hidden="true">/</span> ')}</nav>`;
}
function stylesheet(html, prefix = '../') {
    if (!html.includes('assets/css/study-content.css')) html = html.replace('</head>', `<link rel="stylesheet" href="${prefix}assets/css/study-content.css">\n</head>`);
    return html;
}
function documentLink(value) {
    if (!value) return null;
    let file = String(value).split('/').pop();
    if (!/\.(pdf|zip)$/i.test(file)) file += '.pdf';
    if (!fs.existsSync(path.join(root, 'assets/documents/fees', file))) return null;
    return {href:'/assets/documents/fees/' + file, type:file.endsWith('.zip') ? 'ZIP' : 'PDF'};
}
module.exports = {fs, path, root, origin, read, esc, plain, rich, jsonScript, urlFor, elementRange, replaceElement, block, metadata, breadcrumbs, breadcrumbHtml, stylesheet, documentLink};
