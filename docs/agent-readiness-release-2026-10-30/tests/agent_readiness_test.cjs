'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const origin = 'http://127.0.0.1:8137';
// CGI mode executes real PHP request handling without a loopback listener.
if (process.env.PHP_CGI) global.fetch = async (url, options={}) => {
    const pathname = new URL(url).pathname;
    const file = path.resolve('.'+pathname);
    if (!pathname.endsWith('.php')) return new Response(fs.readFileSync(file),{headers:{'Content-Type':'application/json'}});
    const body = options.body || '';
    const headers = options.headers || {};
    const env = {...process.env,REDIRECT_STATUS:'1',SCRIPT_FILENAME:file,SCRIPT_NAME:pathname,REQUEST_URI:pathname,REQUEST_METHOD:options.method||'GET',SERVER_PROTOCOL:'HTTP/1.1',GATEWAY_INTERFACE:'CGI/1.1',CONTENT_LENGTH:String(Buffer.byteLength(body)),CONTENT_TYPE:headers['Content-Type']||''};
    for(const [key,value] of Object.entries(headers)) if(key!=='Content-Type') env['HTTP_'+key.toUpperCase().replaceAll('-','_')]=value;
    const output=execFileSync(process.env.PHP_CGI,['-d','cgi.force_redirect=0'],{env,input:body,encoding:'utf8'});
    const split=output.indexOf('\r\n\r\n');
    assert(split>=0,'CGI response includes headers');
    const lines=output.slice(0,split).split('\r\n');
    const responseHeaders=new Headers();let status=200;
    for(const line of lines){const i=line.indexOf(':');const key=line.slice(0,i);const value=line.slice(i+1).trim();if(key==='Status')status=parseInt(value);else responseHeaders.append(key,value);}
    return new Response(status===202?null:output.slice(split+4),{status,headers:responseHeaders});
};
let checks = 0;
function ok(value,message) { assert(value,message); checks++; }
async function rpc(method,params={},extra={}) {
    return fetch(origin+'/mcp.php',{method:'POST',headers:{Accept:'application/json, text/event-stream','Content-Type':'application/json',...extra},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params})});
}
(async()=>{
    for (const [accept,type] of [['text/markdown','text/markdown'],['text/html','text/html'],['text/markdown;q=0, text/html','text/html'],['text/html;q=1, text/markdown;q=0.5','text/html'],['text/html;q=0.2, text/markdown;q=0.8','text/markdown'],['*/*','text/html']]) {
        const r=await fetch(origin+'/includes/agent-home.php',{headers:{Accept:accept}});
        ok(r.headers.get('content-type').startsWith(type),'Negotiates '+accept);
        ok(r.headers.get('vary').includes('Accept'),'Varies on Accept');
        ok(r.headers.get('link').includes('</llms.txt>') && r.headers.get('link').includes('</index.md>'),'Discovery Link headers');
        const body=await r.text();
        ok(body===fs.readFileSync(type==='text/html'?'index.html':'index.md','utf8'),'Representation matches public file');
    }
    const home=fs.readFileSync('index.html','utf8');
    const schemas=[...home.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m=>JSON.parse(m[1])['@graph']||[]);
    for(const type of ['Organization','Service','WebSite','WebPage']) ok(schemas.some(s=>s['@type']===type),'Schema '+type);
    const org=schemas.find(s=>s['@type']==='Organization');
    ok(org.sameAs[0].includes('61587016386840') && org.email && org.telephone,'Existing business contact and profile');
    for(const link of ['/about','/terms','/contact','mailto:info@onestepmy.com','tel:+601119359497']) ok(home.includes('href="'+link+'"'),'Homepage link '+link);
    const sitemap=fs.readFileSync('sitemap.xml','utf8');
    const dates=JSON.parse(fs.readFileSync('data/sitemap_lastmod.json','utf8'));
    const urls=[...sitemap.matchAll(/<url><loc>([^<]+)<\/loc><lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod><\/url>/g)];
    ok(urls.length===(sitemap.match(/<url>/g)||[]).length,'Every sitemap URL has lastmod');
    for(const [,url,date] of urls){const p=new URL(url).pathname; const file=p==='/'?'index.html':p.slice(1)+'.html';ok(dates[file].lastmod===date && dates[file].sha256===crypto.createHash('sha256').update(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,'')).digest('hex'),'Content fingerprint '+file);ok(date<=new Date().toISOString().slice(0,10),'No future lastmod');}
    ok(fs.readFileSync('robots.txt','utf8').includes('Content-Signal: search=yes, ai-train=no'),'Content signal');
    for(const property of ['document','navigator']) {
        let tool;
        const sandbox={document:{},navigator:{},fetch:async()=>({ok:true,text:async()=>fs.readFileSync('index.md','utf8')})};
        sandbox[property].modelContext={registerTool:t=>{tool=t;}};
        vm.runInNewContext(fs.readFileSync('assets/js/agent-tools.js','utf8'),sandbox);
        ok(tool.name && tool.description && tool.inputSchema && typeof tool.execute==='function','WebMCP registered on '+property);
        ok((await tool.execute()).content[0].text.includes('One-Step'),'WebMCP returns public guide');
    }
    vm.runInNewContext(fs.readFileSync('assets/js/agent-tools.js','utf8'),{document:{},navigator:{}});
    checks++;
    let r=await rpc('initialize',{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'test',version:'1'}});
    let data=await r.json();
    ok(r.status===200 && data.result.protocolVersion==='2025-06-18','MCP initialize');
    ok(!Array.isArray(data.result.capabilities.resources),'Resource capability is an object');
    data=await (await rpc('resources/list')).json();
    ok(data.result.resources.length===3,'MCP lists advertised resources');
    for(const resource of data.result.resources){const response=await (await rpc('resources/read',{uri:resource.uri})).json();ok(response.result.contents[0].text.length>0,'MCP reads '+resource.name);}
    data=await (await rpc('resources/read',{uri:'../../.env.local'})).json();ok(data.error.code===-32002,'Reject private resource');
    data=await (await rpc('tools/call',{name:'submit_application'})).json();ok(data.error.code===-32601,'No unadvertised action');
    ok((await rpc('ping',{}, {Origin:'https://attacker.example'})).status===403,'Reject untrusted Origin');
    ok((await rpc('ping',{}, {'MCP-Protocol-Version':'unsupported'})).status===400,'Reject unsupported version');
    ok((await rpc('ping',{}, {Accept:'text/html'})).status===406,'Require MCP Accept');
    ok((await fetch(origin+'/mcp.php')).status===405,'GET has no SSE');
    r=await fetch(origin+'/mcp.php',{method:'POST',headers:{Accept:'application/json, text/event-stream','Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',method:'notifications/initialized'})});
    ok(r.status===202 && (await r.text())==='','MCP notification accepted');
    const card=await (await fetch(origin+'/.well-known/mcp/server-card.json')).json();
    ok(card.transport.endpoint.endsWith('/mcp.php') && card.serverInfo.name,'Server card describes real endpoint');
    console.log(`Agent readiness: ${checks} checks passed. PHP ${process.env.PHP_CGI?'CGI request/response':'HTTP'} and simulated WebMCP; Apache routing and native browser WebMCP require hosted verification.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
