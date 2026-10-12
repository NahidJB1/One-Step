/* Fee tables are built into the HTML. JavaScript enhances the existing controls. */
document.addEventListener('DOMContentLoaded', initDynamicFees);

function initDynamicFees() {
    setupStaticEvents();
}

function feePanel(button) {
    const controlled = button.getAttribute('aria-controls');
    return controlled ? document.getElementById(controlled) : button.nextElementSibling;
}

function setFeePanel(button, open) {
    const panel = feePanel(button);
    if (!panel) return;
    button.classList.toggle('active', open);
    button.setAttribute('aria-expanded', String(open));
    panel.classList.toggle('open', open);
}

function setupStaticEvents() {
    if (document.body.dataset.feesInitialized) return;
    document.body.dataset.feesInitialized = 'true';
    document.body.classList.add('fees-enhanced');
    document.querySelectorAll('.accordion').forEach((button,index) => {
        const panel = feePanel(button);
        if (!panel) return;
        panel.id ||= `fee-category-${index}`;
        button.setAttribute('aria-controls',panel.id);
        button.type = 'button';
        setFeePanel(button,false);
        button.addEventListener('click',()=>setFeePanel(button,button.getAttribute('aria-expanded') !== 'true'));
    });
    const input = document.getElementById('searchInput');
    if (input) {
        input.setAttribute('aria-label','Search programs in the fee chart');
        input.removeAttribute('onkeyup');
        input.addEventListener('input',filterPrograms);
        input.addEventListener('keydown',event=>{ if (event.key === 'Enter') filterPrograms(); });
        const status = document.createElement('p');
        status.id = 'fee-search-status';
        status.className = 'fee-search-status';
        status.setAttribute('role','status');
        input.closest('.search-container').appendChild(status);
        document.querySelector('.search-icon-btn')?.addEventListener('click',filterPrograms);
        // URLSearchParams already decodes; a second decode broke literal '%' queries.
        const term = new URLSearchParams(window.location.search).get('q');
        if (term) { input.value = term; filterPrograms(); }
    }
    function revealLinkedFeeSection(hash = location.hash) {
        if (!/^#fee-category-\d+$/.test(hash)) return;
        const button = Array.from(document.querySelectorAll('.accordion')).find(b => '#'+b.getAttribute('aria-controls') === hash);
        if (!button) return;
        // A section link must not land in a table hidden by a previous search.
        if (input?.value) { input.value = ''; filterPrograms(); }
        setFeePanel(button,true);
        feePanel(button).scrollIntoView({block:'start'});
    }
    window.addEventListener('hashchange',() => revealLinkedFeeSection());
    document.querySelectorAll('a[href^="#fee-category-"]').forEach(link => link.addEventListener('click',() => {
        // Reveal before the browser follows the anchor, including repeated clicks.
        revealLinkedFeeSection(link.hash);
    }));
    revealLinkedFeeSection();
}

function filterPrograms() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    const term = input.value.toLocaleLowerCase().trim();
    let found = 0;
    document.querySelectorAll('.panel').forEach(panel => {
        let panelMatches = 0;
        panel.querySelectorAll('table').forEach(table=>{
            const rows = Array.from(table.rows).filter(row=>row.querySelector('td'));
            rows.forEach(row=>{
                const match = !term || row.textContent.toLocaleLowerCase().includes(term);
                row.style.display = match ? '' : 'none';
                row.classList.toggle('highlight',Boolean(term && match));
                if (match) panelMatches++;
            });
        });
        found += panelMatches;
        const button = Array.from(document.querySelectorAll('.accordion')).find(b=>feePanel(b) === panel);
        if (button) setFeePanel(button,Boolean(term && panelMatches));
    });
    const status = document.getElementById('fee-search-status');
    if (status) status.textContent = term ? `${found} matching fee ${found === 1 ? 'row' : 'rows'}.` : '';
}

function downloadPDF(filename) {
    const link = document.createElement('a');
    link.href = filename.includes('/') ? filename : `../assets/documents/fees/${filename.includes('.') ? filename : filename+'.pdf'}`;
    link.download = filename.split('/').pop();
    document.body.appendChild(link);
    link.click();
    link.remove();
}
