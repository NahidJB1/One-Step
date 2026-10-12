/* =========================================
   SEARCH PAGE - STANDALONE SEARCH ENGINE
   Same search logic as index.js but isolated
   for the dedicated /search page.
   ========================================= */

// Global Variables
let ALL_PROGRAMS_DATA = [];
let rawSearchResults = [];
let filteredResults = [];
let visibleResultsCount = 0;

// Function to get results per page based on screen width
function getResultsPerPage() {
  const width = window.innerWidth;
  if (width >= 1024) return 16;
  if (width >= 768) return 10;
  return 5;
}

// Load Data on Startup
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('universities.json?v=2');
        if (!response.ok) throw new Error("JSON not found");
        ALL_PROGRAMS_DATA = await response.json();
        
        // Map levels to user preferred terminology
        ALL_PROGRAMS_DATA.forEach(uni => {
            if (uni.programs) {
                uni.programs.forEach(prog => {
                    if (prog.level === 'Degree') prog.level = 'Bachelor';
                    if (prog.level === 'Master') prog.level = "Master's";
                    if (prog.level === 'Doctorate') prog.level = 'PhD';
                });
            }
        });

        // Update stats counts
        updateStats();

        console.log("Search Page Engine: Ready");

        // Check for ?q= parameter to auto-search
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q');
        if (query) {
            document.getElementById('programSearchInput').value = query;
            triggerSearch();
        }
    } catch (error) {
        console.error("Search Engine Error:", error);
    }
});

// Update the stats in the hero section
function updateStats() {
    const uniCountEl = document.getElementById('searchUniCount');
    const progCountEl = document.getElementById('searchProgCount');
    
    if (uniCountEl && window.UNIVERSITY_META) {
        uniCountEl.textContent = Object.keys(window.UNIVERSITY_META).length + '+';
    }
    
    if (progCountEl) {
        let totalProgs = 0;
        ALL_PROGRAMS_DATA.forEach(uni => {
            if (window.UNIVERSITY_META && window.UNIVERSITY_META[uni.name]) {
                totalProgs += (uni.programs ? uni.programs.length : 0);
            }
        });
        progCountEl.textContent = totalProgs + '+';
    }
}

// Quick search from popular tags
function quickSearch(term) {
    const input = document.getElementById('programSearchInput');
    input.value = term;
    triggerSearch();
    
    // Smooth scroll to results
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* =========================================
   SEARCH FUNCTIONS
   ========================================= */

function triggerSearch() {
    const input = document.getElementById("programSearchInput").value.toLowerCase().trim();
    const resultBox = document.getElementById("searchResults");
    const seeMoreBox = document.getElementById("seeMoreContainer");
    const filterBox = document.getElementById("filterContainer");
    const popularBox = document.getElementById("popularSearches");

    // Reset UI
    resultBox.innerHTML = "";
    seeMoreBox.style.display = "none";
    filterBox.style.display = "none";
    filterBox.innerHTML = "";
    
    rawSearchResults = [];
    filteredResults = [];
    visibleResultsCount = 0;

    if (input.length < 2) {
        // Show popular searches when input is cleared
        if (popularBox) popularBox.style.display = "block";
        return;
    }

    // Hide popular searches when searching
    if (popularBox) popularBox.style.display = "none";

    const searchTerms = input.split(' ').filter(term => term.length > 0);

    // Find All Matches
    ALL_PROGRAMS_DATA.forEach(uni => {
        const uniName = uni.name;
        if (!window.UNIVERSITY_META || !window.UNIVERSITY_META[uniName]) return;
        const meta = window.UNIVERSITY_META[uniName];
        const uniLink = `/Fees_Chart/${meta.slug}-fees`;

        uni.programs.forEach(program => {
            const progName = program.name;
            const fullTextToCheck = (uniName + " " + progName).toLowerCase();
            const isMatch = searchTerms.every(term => fullTextToCheck.includes(term));

            if (isMatch) {
                rawSearchResults.push({
                    uniName: uniName,
                    progName: progName,
                    level: program.level || "Other",
                    duration: program.duration || "N/A",
                    link: uniLink
                });
            }
        });
    });

    // Handle Filters
    const initialResultsCount = getResultsPerPage();
    if (rawSearchResults.length > initialResultsCount) {
        generateFilters(rawSearchResults);
    }

    // Initial Render
    filteredResults = [...rawSearchResults];
    
    if (filteredResults.length > 0) {
        renderResultsBatch();
    } else {
        resultBox.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: white;">
                <i class="fas fa-search" style="font-size: 40px; margin-bottom: 15px; opacity: 0.5;"></i>
                <p>No programs found. Try different keywords.</p>
            </div>
        `;
    }
}

// GENERATE FILTER BUTTONS
function generateFilters(results) {
    const filterBox = document.getElementById("filterContainer");
    const initialResultsCount = getResultsPerPage();
    
    if (results.length <= initialResultsCount) {
        filterBox.style.display = "none";
        return;
    }
    
    const levels = new Set();
    
    results.forEach(item => {
        if(item.level && isNaN(item.level)) levels.add(item.level);
    });

    if (levels.size > 1) {
        filterBox.style.display = "flex";
        
        let html = `<button class="filter-btn active" data-category="All">All (${results.length})</button>`;
        
        levels.forEach(level => {
            const count = results.filter(r => r.level === level).length;
            const safeLevel = level.replace(/"/g, '&quot;');
            html += `<button class="filter-btn" data-category="${safeLevel}">${level} (${count})</button>`;
        });

        filterBox.innerHTML = html;
        
        filterBox.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                applyFilter(this.getAttribute('data-category'), this);
            });
        });
    }
}

// APPLY FILTER LOGIC
function applyFilter(category, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    if (category === 'All') {
        filteredResults = [...rawSearchResults];
    } else {
        filteredResults = rawSearchResults.filter(item => item.level === category);
    }

    document.getElementById("searchResults").innerHTML = "";
    document.getElementById("seeMoreContainer").style.display = "none";
    visibleResultsCount = 0;
    renderResultsBatch();
}

// RENDER FUNCTION
function renderResultsBatch() {
    const resultBox = document.getElementById("searchResults");
    const seeMoreBox = document.getElementById("seeMoreContainer");
    
    const resultsPerPage = getResultsPerPage();
    const nextBatch = filteredResults.slice(visibleResultsCount, visibleResultsCount + resultsPerPage);

    nextBatch.forEach((item, index) => {
        const delay = index * 0.05; 
        const encodedProg = encodeURIComponent(item.progName);
        const finalUrl = `${item.link}?q=${encodedProg}`;

        const cardHTML = `
            <div class="result-card" style="animation-delay: ${delay}s">
                <div>
                    <div class="result-uni"><i class="fas fa-university"></i> ${item.uniName}</div>
                    <h4 class="result-program">${item.progName}</h4>
                    <div class="result-meta">
                        <span class="meta-tag"><i class="fas fa-layer-group"></i> ${item.level}</span>
                        <span class="meta-tag"><i class="fas fa-clock"></i> ${item.duration}</span>
                    </div>
                </div>
                <a href="${finalUrl}" class="view-fees-btn">
                    View Details <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        `;
        resultBox.insertAdjacentHTML('beforeend', cardHTML);
    });

    visibleResultsCount += nextBatch.length;

    if (visibleResultsCount < filteredResults.length) {
        seeMoreBox.style.display = "block";
        const btn = document.getElementById("seeMoreBtn");
        const remaining = filteredResults.length - visibleResultsCount;
        const resultsPerLoad = getResultsPerPage();
        const nextLoad = Math.min(remaining, resultsPerLoad);
        
        btn.innerText = `Load ${nextLoad} More (${remaining} total remaining)`;
        btn.onclick = renderResultsBatch;
    } else {
        seeMoreBox.style.display = "none";
    }
}

// Enter key support
const searchInput = document.getElementById('programSearchInput');
if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            triggerSearch();
        }
    });
}
