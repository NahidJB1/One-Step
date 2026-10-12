'use strict';
module.exports = function buildArticles({H,fees,rankings,short,feeId,feeFile,detailFile,save,rendered}) {
    const {fs,path,root,read,esc,plain,rich,block,metadata,breadcrumbs,breadcrumbHtml,replaceElement,stylesheet,urlFor,origin} = H;
    const guides = require('./student_guides')({H,rankings,fees});
    const articleFiles = [...new Set([...fs.readdirSync(path.join(root,'Articles')).filter(f=>f.endsWith('.html')).map(f=>'Articles/'+f), ...Object.keys(guides.pages)])].sort();
    const articleTitles = {
        'Articles/top-10-universities-in-malaysia.html':`Top 10 Universities in Malaysia: QS World ${rankings.editions.world}`,
        'Articles/cheapest-universities.html':'10 Affordable Universities in Malaysia: Tuition Fee Comparison',
        'Articles/scholarships-for-international-students-malaysia.html':'Malaysia Scholarships for International Students: Application Guide',
        'Articles/best-engineering-universities-malaysia.html':'Engineering Universities in Malaysia: Courses, Fees & Rankings',
        'Articles/mmu-vs-taylors.html':"MMU vs Taylor's University: Tuition Fees, Courses & QS Rankings"
    };
    const descriptions = {
        'Articles/top-10-universities-in-malaysia.html':`See Malaysia's top 10 universities in QS World ${rankings.editions.world}, with source links, ranking methodology and university fee guides.`,
        'Articles/cheapest-universities.html':'Looking for the cheapest universities in Malaysia? Compare 10 university options using program examples, exact fee labels and scholarship conditions.',
        'Articles/scholarships-for-international-students-malaysia.html':'Learn how to check Malaysia university scholarships, eligibility and final tuition fees as an international or Bangladeshi student. Compare fee-chart conditions.',
        'Articles/best-engineering-universities-malaysia.html':'Compare engineering course schedules at UTM, UPM, MMU, APU and KLUST. Check fee periods, campus choices and the difference between overall and subject rankings.',
        'Articles/mmu-vs-taylors.html':"Compare MMU and Taylor's using dated QS rankings, course fee charts and campus information. Choose according to your course, eligibility and total budget."
    };
    function sampleProgram(id) {
        const uni = fees[feeId(id)], candidates=[];
        for (const cat of uni.categories) {
            const table = cat.table;
            if (!table) continue;
            const programIndex = table.headers.findIndex(h=>/program|course name/i.test(h));
            if (programIndex < 0) continue;
            for (const row of table.rows) {
                const name = plain(row[programIndex]);
                if (!/bachelor|\bBBA\b|degree/i.test(name) || /master|doctor|diploma|phd/i.test(name)) continue;
                const feeColumns = table.headers.map((h,i)=>({label:plain(h),value:row[i]})).filter(c=>/fee|total|year\s*[1-5]|scholarship/i.test(c.label) && !/total semester|duration|intake|^year$/i.test(c.label) && c.value && /\d/.test(c.value));
                if (!feeColumns.length) continue;
                candidates.push({name,cat:plain(cat.category_name),feeColumns, score:/business administration|business management|management \(honours\)/i.test(name) ? 0 : /computer|software/i.test(name) ? 1 : 2});
            }
        }
        candidates.sort((a,b)=>a.score-b.score);
        if (!candidates.length) throw new Error('No fee example for '+id);
        return candidates[0];
    }
    function affordableArticle(html) {
        const ids = ['klust','kings','alfa','cyberjaya','unirazak','cityu','binary','segi','amu','inti'];
        const cards = ids.map(id=>{
            const sample = sampleProgram(id);
            const image = read(detailFile(id)).match(/<img\b[^>]*src="([^"]+)"[^>]*>/)?.[1];
            return `<div class="uni-card">${image ? `<img src="${esc(image)}" alt="${esc(short(id))} campus" class="uni-card-img" loading="lazy" decoding="async">` : ''}<div class="uni-card-body"><h2>${esc(short(id))}</h2><p><strong>Program example:</strong> ${esc(sample.name)}<br><strong>Schedule section:</strong> ${esc(sample.cat)}</p><table class="fee-table"><caption>Published labels and amounts for this example</caption><tbody>${sample.feeColumns.map(c=>`<tr><th scope="row">${esc(c.label)}</th><td>${rich(c.value)}</td></tr>`).join('')}</tbody></table><p>Check the linked schedule for initial charges, student category, tax, scholarship conditions and intake validity. These columns are not interchangeable with another university's fee basis.</p><div class="uni-card-actions"><a class="btn btn-primary" href="/${feeFile(id).replace('.html','')}">Full fees and conditions</a><a class="btn btn-secondary" href="/${detailFile(id).replace('.html','')}">University details</a></div></div></div>`;
        });
        html = replaceElement(html, /<section class="article-body">/,`<section class="article-body"><div class="container"><div class="study-content"><h2>Looking for the cheapest universities in Malaysia?</h2><p>Use these ten university options as a starting point for a budget comparison. Each card shows one bachelor's program example from the fee information on One-Step, with its original fee labels. This is an editorial shortlist, not a verified national ranking from cheapest to most expensive.</p><p>Fees depend on course, campus, delivery mode, student category, intake and scholarship conditions. The examples below are not university-wide minimum prices. In particular, compare tuition with tuition, and whole-program totals with whole-program totals. Include additional charges and living expenses when setting your budget.</p></div><div class="uni-grid">${cards.join('\n')}</div><div class="study-content"><h2>How to compare fees before applying</h2><ol><li>Choose the same qualification level and subject at each university.</li><li>Confirm that the quote applies to international students and your intended campus and study mode.</li><li>Separate tuition from application, registration, visa, insurance, accommodation and other charges.</li><li>Confirm any scholarship reduction and its renewal conditions in writing.</li><li>Request the actual annual or semester payment schedule when only a total is published.</li></ol><h3>Which is the cheapest university for Bangladeshi students?</h3><p>The stored schedules do not establish one cheapest institution for every Bangladeshi applicant. Compare your exact course and intake, and confirm nationality-specific costs. An English-language course, an online degree and a campus-based bachelor's program are different products.</p><p><a href="/explore-universities">Browse all university fee charts</a> · <a href="/Articles/scholarships-for-international-students-malaysia">Check scholarship conditions</a> · <a href="/Articles/cost-of-living-malaysia-international-students">Plan living expenses</a></p></div></div></section>`);
        html = html.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/,'<h1 class="hero-title">10 Affordable Universities in Malaysia: Tuition Fee Comparison</h1>');
        html = html.replace(/<p class="hero-subtitle">[\s\S]*?<\/p>/,'<p class="hero-subtitle">Compare course examples and published fee labels to build a shortlist for your budget.</p>');
        return {html,extra:[]};
    }
    function courseComparison(html,file) {
        const engineering=file.includes('engineering');
        const ids=engineering ? ['utm','upm','mmu','apu','klust'] : ['mmu','taylors'];
        const display=metric=>metric.status==='ranked' ? '#'+metric.rank.replace(/-/g,'–') : ({not_listed:'Not listed',contributor:'QS Contributor (no rank)',unverified:'Not verified'}[metric.status]);
        const title=articleTitles[file];
        html=replaceElement(html,/<section class="article-body">/,`<section class="article-body"><div class="container"><div class="study-content"><h2>${engineering ? 'How to choose an engineering university in Malaysia' : "How do MMU and Taylor's compare?"}</h2><p>${engineering ? 'Start with the engineering discipline you want to study, then compare the qualification, campus, course structure and fee schedule. This is a course-planning shortlist, not a subject-ranking league table.' : 'Choose your course first, then compare the specific campus, program structure, entry requirements and budget. A university-wide ranking or price range cannot decide which offer is right for every student.'}</p><p>The overall QS figures below use the ranking information verified on ${rankings.verified_at}. Overall university rankings do not establish a rank for engineering, computing, business or hospitality.</p></div><div class="uni-grid">${ids.map(id=>{
            const record=rankings.universities[id],uni=fees[feeId(id)];
            const image=read(detailFile(id)).match(/<img\b[^>]*src="([^"]+)"[^>]*>/)?.[1];
            const categories=[...new Set(uni.categories.filter(c=>!engineering || /engineering/i.test(JSON.stringify(c))).map(c=>plain(c.category_name)))].slice(0,6);
            return `<div class="uni-card">${image ? `<img src="${esc(image)}" alt="${esc(short(id))} campus" class="uni-card-img" loading="lazy" decoding="async">` : ''}<div class="uni-card-body"><h2>${esc(short(id))}</h2><div class="rank-stats"><div class="rank-stat"><strong>QS World ${record.world.year}:</strong> ${esc(display(record.world))}</div><div class="rank-stat"><strong>QS Asia ${record.asia.year}:</strong> ${esc(display(record.asia))}</div></div><p><strong>Sections to check in the course schedule:</strong> ${esc(categories.join('; ') || 'Consult the course catalog and fee documents')}.</p><p>Read the exact program title and campus before comparing fees. ${id==='utm' ? 'Some UTM course tables list programs and semesters without monetary amounts; those rows need a written fee quotation.' : 'Use the source column labels to distinguish tuition, first payments, annual amounts and totals. Check additional charges and any conditional reductions.'}</p><div class="uni-card-actions"><a class="btn btn-primary" href="/${feeFile(id).replace('.html','')}">${esc(short(id))} fee chart</a><a class="btn btn-secondary" href="/${detailFile(id).replace('.html','')}#rankings">Ranking sources and campus</a></div></div></div>`;
        }).join('')}</div><div class="study-content"><h2>Build a comparable shortlist</h2><ol><li>Confirm the exact degree title, entry requirements, campus and study mode.</li><li>Check course content and ${engineering ? 'the accreditation and professional recognition relevant to your engineering discipline and intended country of employment' : 'recognition relevant to your intended career'} directly with the awarding institution and relevant body.</li><li>Ask for an intake-specific international-student quote with the full payment schedule.</li><li>Compare tuition, additional charges, accommodation and living expenses separately.</li><li>Confirm scholarship eligibility and renewal conditions before using a reduced fee in your budget.</li></ol><h3>${engineering ? 'Which university is best for engineering?' : "Is MMU cheaper than Taylor's?"}</h3><p>${engineering ? 'That depends on the discipline, degree recognition, course structure and your priorities. The stored ranking data covers overall university rankings; it does not verify an engineering subject ranking for these programs.' : 'There is no single price comparison that applies to all courses. Use the same level of study, subject, campus and student category, and compare the same fee period. The linked schedules are the starting point for a course-specific comparison.'}</p><p><a href="/Articles/top-10-universities-in-malaysia">Covered-university QS comparison</a> · <a href="/Articles/cheapest-universities">Affordable university fee examples</a> · <a href="/Articles/scholarships-for-international-students-malaysia">Scholarship application guide</a></p></div></div></section>`);
        html=html.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/,`<h1 class="hero-title">${esc(title)}</h1>`).replace(/<p class="hero-subtitle">[\s\S]*?<\/p>/,'<p class="hero-subtitle">Compare course schedules, published fee labels and dated ranking sources before applying.</p>');
        return {html,extra:[]};
    }
    for (const file of articleFiles) {
        if (guides.pages[file]) {
            articleTitles[file] = guides.pages[file].title;
            save(file,guides.render(file));
            continue;
        }
        let html = read(file), extra=[];
        if (file.endsWith('/cheapest-universities.html')) ({html,extra}=affordableArticle(html));
        if (/\/(?:best-engineering-universities-malaysia|mmu-vs-taylors)\.html$/.test(file)) ({html,extra}=courseComparison(html,file));
        const title = articleTitles[file] || plain(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1]);
        const description = descriptions[file] || plain(html.match(/<meta name="description" content="([^"]*)"/)?.[1]);
        const crumbs = [['Home','index.html'],['Student guides','articles.html'],[title,file]];
        html = block(html,'article-navigation',`<section class="container study-content">${breadcrumbHtml(crumbs)}<h2>Related study guides</h2><p><a href="/explore-universities">University fee charts and profiles</a> · <a href="/Articles/top-10-universities-in-malaysia">QS university ranking comparison</a> · <a href="/Articles/cheapest-universities">Affordable university fee comparison</a> · <a href="/Articles/scholarships-for-international-students-malaysia">Scholarship application guide</a></p><p>Published by <a href="/contact">One-Step</a>, a student guidance service. Contact us to ask about a source or report information that needs updating.</p></section>`,'<div id="global-footer-placeholder">');
        html = metadata(html,file,title+' | One-Step',description,[{'@type':'Article','@id':urlFor(file)+'#article',headline:title,description,mainEntityOfPage:urlFor(file),inLanguage:'en',author:{'@type':'Organization',name:'One-Step',url:origin+'/'},publisher:{'@type':'Organization',name:'One-Step',url:origin+'/'}},breadcrumbs(crumbs),...extra],'article');
        save(file,stylesheet(html));
    }
    let hub = guides.updateHub(read('articles.html'));
    hub = hub.replace('10 Cheapest Universities in Malaysia','10 Affordable Universities in Malaysia')
        .replace(/Discover how to secure up to RM 100,000[^<]*/g,'Check scholarship eligibility, fee reductions and application conditions for international students.')
        .replace(/Discover the highest-ranked universities in Malaysia for 2026\.[^<]*/g,`Compare Malaysia's top ten entries in QS World ${rankings.editions.world}, with sources and links to tuition fee guides.`)
        .replace(/<span>\d+ Guides<\/span>/,`<span>${articleFiles.length} Guides</span>`);
    hub = hub.replace('<h1>Our <span>Expert</span> Guides</h1>','<h1>Study in Malaysia <span>Guides</span></h1>')
        .replace('Deeply researched articles and rankings to help you make the best decision about where and how to study.','University fee comparisons, dated QS rankings and practical study-planning articles.');
    const list = articleFiles.map(file=>({file,title:articleTitles[file] || plain((rendered.get(file)||read(file)).match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1])}));
    const groups=require('./article_seo').groups;
    const grouped=groups.map(g=>`<div><h3>${esc(g.title)}</h3><ul>${g.keys.map(key=>{const [file,d]=Object.entries(guides.pages).find(([f,d])=>d.key===key);return `<li><a href="/${file.replace('.html','')}">${esc(d.title)}</a></li>`;}).join('')}</ul></div>`).join('');
    hub = block(hub,'article-directory',`<section class="container study-content guide-topic-directory"><h2>Find the right study guide</h2><p>Choose a course, compare the full cost, then prepare your application. Our guides link to official sources and One-Step university fee schedules.</p><div class="guide-topic-columns">${grouped}</div><p><a href="/explore-universities">Browse university tuition fee charts and profiles</a></p></section>`,'<div id="global-footer-placeholder">');
    const hubTitle='Study in Malaysia: University, Fees & Visa Guides | One-Step';
    const hubDescription='Plan your studies in Malaysia with guides to universities, courses, tuition fees, living costs, scholarships and student visa requirements.';
    hub = metadata(hub,'articles.html',hubTitle,hubDescription,[{'@type':'CollectionPage','@id':urlFor('articles.html')+'#collection',url:urlFor('articles.html'),name:'Study in Malaysia guides',description:hubDescription,inLanguage:'en',mainEntity:{'@type':'ItemList',numberOfItems:list.length,itemListElement:list.map((a,i)=>({'@type':'ListItem',position:i+1,url:urlFor(a.file),name:a.title}))}},breadcrumbs([['Home','index.html'],['Student guides','articles.html']])]);
    save('articles.html',stylesheet(hub,''));
};
