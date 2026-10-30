'use strict';
// Persist content fingerprints. Unchanged content retains its date across builds.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
module.exports = function(root, pages, contentFor, save) {
    const file = 'data/sitemap_lastmod.json';
    const previous = fs.existsSync(path.join(root,file)) ? JSON.parse(fs.readFileSync(path.join(root,file),'utf8')) : {};
    const records = {};
    const today = new Date().toISOString().slice(0,10);
    for (const page of pages) {
        const sha256 = crypto.createHash('sha256').update(contentFor(page)).digest('hex');
        let date = previous[page]?.lastmod;
        if (!previous[page]) {
            // Conservative initial baseline: last recorded content commit, not file-copy time.
            try { date = execFileSync('git',['-c','core.fsmonitor=false','log','-1','--format=%cs','--',page],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim(); } catch {}
            date = date || today;
        } else if (previous[page].sha256 !== sha256) date = today;
        records[page] = {sha256,lastmod:date};
    }
    save(file,JSON.stringify(records,null,2)+'\n');
    return records;
};
