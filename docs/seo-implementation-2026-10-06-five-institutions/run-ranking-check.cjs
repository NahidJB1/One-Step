// Test-runner workaround only: consume the local readiness response with node:http.
// The ranking test's assertions and production files are unchanged.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const file=path.resolve(__dirname,'../../tests/university_rankings_pages_test.js');
let source=fs.readFileSync(file,'utf8');
source=source.replace('await fetch(base); ready=true;',"await new Promise((resolve,reject)=>{const req=require('node:http').get(base,res=>{res.resume();resolve();});req.on('error',reject);}); ready=true;");
const mod=new Module(file,module);mod.filename=file;mod.paths=Module._nodeModulePaths(path.dirname(file));mod._compile(source,file);
