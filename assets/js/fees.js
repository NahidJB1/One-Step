/* assets/js/fees.js */

document.addEventListener("DOMContentLoaded", function() {
    initDynamicFees();
});

async function initDynamicFees() {
    const uniId = document.body.dataset.uniId;
    if (!uniId) {
        // Fallback for static pages if dataset is missing
        setupStaticEvents();
        return;
    }

    try {
        const res = await fetch('../data/fees_data.json?v=2');
        const data = await res.json();
        
        const uni = data[uniId];
        if (!uni) {
            console.error("No fee data found for " + uniId);
            return;
        }

        renderDynamicFees(uni);
        setupStaticEvents();
        
    } catch(err) {
        console.error("Error loading fees data:", err);
    }
}

function renderDynamicFees(uni) {
    // 1. Inject Theme Colors
    if (uni.theme && uni.theme.theme_color) {
        document.documentElement.style.setProperty('--theme-color', uni.theme.theme_color);
        document.documentElement.style.setProperty('--theme-dark', uni.theme.theme_dark);
        document.documentElement.style.setProperty('--theme-accent', uni.theme.theme_accent);
        document.documentElement.style.setProperty('--theme-light', uni.theme.theme_light);
    } else {
        // Fallback for universities with missing theme data
        document.documentElement.style.setProperty('--theme-color', '#0B1B3D');
        document.documentElement.style.setProperty('--theme-dark', '#050D20');
        document.documentElement.style.setProperty('--theme-accent', '#FFD700');
        document.documentElement.style.setProperty('--theme-light', '#1A2F5C');
    }

    // 2. Inject Header
    const logoContainer = document.querySelector('.logo-container');
    if (logoContainer && uni.logo && !logoContainer.querySelector('.static-logo')) {
        logoContainer.innerHTML = `<img src="${uni.logo}" alt="Logo" class="static-logo">`;
    }

    const headerText = document.querySelector('.header-text');
    if (headerText) {
        headerText.innerHTML = `
            <h1>${uni.title || ''}</h1>
            <h2>${uni.subtitle || ''}</h2>
            <p>${uni.validity || ''}</p>
            <p style="font-size: 0.85rem; color: var(--theme-light); margin-top: 10px; opacity: 0.9;">
              Official tuition fees per semester for Local and International students (including Bangladesh, India, China, etc.). Find the exact cost of studying at ${uni.title || 'this university'}.
            </p>
        `;
        
        if (uni.file_link) {
            let btnText = uni.file_link.endsWith('.zip') ? 'Download All Documents (ZIP)' : 'Download Fees (PDF)';
            let btnIcon = uni.file_link.endsWith('.zip') ? 'fa-file-archive' : 'fa-file-pdf';
            headerText.innerHTML += `
                <div style="margin-top: 25px;">
                    <button onclick="downloadPDF('${uni.file_link}')" style="background: var(--theme-accent); color: var(--theme-dark); border: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.15); font-size: 0.95rem; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                        <i class="fas ${btnIcon}"></i> ${btnText}
                    </button>
                </div>
            `;
        }
    }
    
    document.title = `${uni.title || 'University'} - International Fee Structure`;

    // 3. Inject Categories
    const container = document.getElementById('dynamicFeesContainer');
    if (!container) return; // Must have this wrapper in the HTML

    let html = '';
    
    uni.categories.forEach(cat => {
        // If category_name is present, use accordion
        if (cat.category_name) {
            html += `<button class="accordion">${cat.category_name}</button>`;
            html += `<div class="panel">`;
        } else {
            html += `<div class="panel" style="display: block; border-top: 1px solid #e0e6ed; border-radius: 12px;">`;
        }
        
        // Render Table
        if (cat.table && cat.table.rows && cat.table.rows.length > 0) {
            html += `<table>`;
            if (cat.table.headers && cat.table.headers.length > 0) {
                html += `<tr>`;
                cat.table.headers.forEach(h => { html += `<th>${h}</th>`; });
                html += `</tr>`;
            }
            cat.table.rows.forEach(row => {
                html += `<tr>`;
                row.forEach(cell => { html += `<td>${cell}</td>`; });
                html += `</tr>`;
            });
            html += `</table>`;
        }
        
        // Render Note
        if (cat.remarks || cat.pdf_link) {
            html += `<div class="note">`;
            if (cat.pdf_link) {
                let dlText = cat.pdf_link.endsWith('.zip') ? 'Download ZIP' : 'Download PDF';
                html += `<div class="download-bar" onclick="downloadPDF('${cat.pdf_link}')">
                            <span>${dlText}</span>
                            <span>⬇️</span>
                         </div>`;
            }
            if (cat.remarks) {
                html += cat.remarks;
            }
            html += `</div>`;
        }
        
        html += `</div>`;
    });
    
    container.innerHTML = html;
}

function setupStaticEvents() {
    // Accordion Logic
    const acc = document.querySelectorAll(".accordion");
    acc.forEach(btn => {
        // Remove existing listeners to avoid duplicates
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener("click", function() {
            this.classList.toggle("active");
            const panel = this.nextElementSibling;
            if (panel.style.display === "block") {
                panel.style.display = "none";
            } else {
                panel.style.display = "block";
            }
        });
    });

    // Search Logic (URL Parameter)
    const searchTerm = new URLSearchParams(window.location.search).get('q');
    if (searchTerm) {
        const input = document.getElementById('searchInput');
        if(input) {
            input.value = decodeURIComponent(searchTerm);
            filterPrograms(); 
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    // Add event listener for search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', filterPrograms);
    }
}

function filterPrograms() {
    const input = document.getElementById("searchInput").value.toLowerCase().trim();
    const tables = document.querySelectorAll("table");

    tables.forEach(table => {
        const rows = table.querySelectorAll("tr");
        let foundInTable = false;

        for (let i = 1; i < rows.length; i++) {
            const rowText = rows[i].textContent.toLowerCase();
            if (input !== "" && rowText.includes(input)) {
                rows[i].style.display = "";
                rows[i].classList.add("highlight"); 
                foundInTable = true;
            } else if (input === "") {
                rows[i].style.display = "";
                rows[i].classList.remove("highlight");
            } else {
                rows[i].style.display = "none";
                rows[i].classList.remove("highlight");
            }
        }

        const panel = table.closest(".panel");
        const accordion = panel.previousElementSibling;
        
        if (accordion && accordion.classList.contains("accordion")) {
            if (foundInTable && input !== "") {
                panel.style.display = "block";
                accordion.classList.add("active");
            } else if (input === "") {
                panel.style.display = "none";
                accordion.classList.remove("active");
            }
        }
    });
}

function downloadPDF(filename) {
    const link = document.createElement("a");
    if(filename.includes('/')) {
        link.href = filename;
    } else if(filename.includes('.')) {
        link.href = `../assets/documents/fees/${filename}`;
    } else {
        link.href = `../assets/documents/fees/${filename}.pdf`;
    }
    link.download = filename.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
